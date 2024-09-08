const { IgApiClient, IgCheckpointError, IgLoginTwoFactorRequiredError } = require('instagram-private-api');
const inquirer = require('inquirer');
const { get } = require('request-promise');

const temporaryPostService = require('./temporarypost.service');
const categoryService = require('./category.service');
const schedule = require('node-schedule'); // Import node-schedule

const intervalBetweenPosts = 10; // Interval in minutes between each post

const loginToInstagram = async (account) => {
    const ig = new IgApiClient();
    let instagramUsername = account.username;
    let instagramPassword = account.password;
    ig.state.generateDevice(instagramUsername);

    try {
        const auth = await ig.account.login(instagramUsername, instagramPassword);
        console.log('Logged in:', auth);
        return ig;
    } catch (error) {
        if (error instanceof IgCheckpointError) {
            console.log('Checkpoint detected:', ig.state.checkpoint);

            await ig.challenge.auto(true);

            const challengeUrl = ig.state.checkpoint.challenge.api_path;
            console.log(`Please visit ${challengeUrl} to verify your account.`);

            const { code } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'code',
                    message: 'Enter the security code you received:',
                },
            ]);

            await ig.challenge.sendSecurityCode(code);

            const auth = await ig.account.login(instagramUsername, instagramPassword);
            console.log('Logged in after challenge:', auth);
            return ig;

        } else if (error instanceof IgLoginTwoFactorRequiredError) {
            const { username, totp_two_factor_on, two_factor_identifier } = error.response.body.two_factor_info;
            const { code } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'code',
                    message: 'Enter the 2FA code you received:',
                },
            ]);

            const auth = await ig.account.twoFactorLogin({
                username,
                verificationCode: code,
                twoFactorIdentifier: two_factor_identifier,
                verificationMethod: totp_two_factor_on ? '0' : '1',
                trustThisDevice: '1',
            });
            console.log('Logged in with 2FA:', auth);
            return ig;

        } else {
            console.error('Failed to login:', error);
            throw error;
        }
    }
};

const uploadPhoto = async (instaAccountInst, posts) => {
    const concurrency = 10; // Set your desired concurrency level
    let response = [];

    // Function to handle the upload for a single post
    const uploadSinglePhoto = async (instaAccountInst, post) => {
        let imageUrl = post.mediaUrl;
        let caption = `${post.caption}\n${post.hashtags}`;
        // let caption = post.caption + "\n" + post.hashtags;

        try {
            let igresp = await uploadPhotoToInstagram(instaAccountInst, imageUrl, caption);
            if (igresp.success) {
                await temporaryPostService.updateTemporaryPostById(post.id, { status: 'published', uploadId: igresp.uploadId });
            }
            response.push({ id: post.id, uploadId: igresp.uploadId, success: igresp.success, message: igresp.message });
        } catch (error) {
            console.error(`Failed to upload photo for post ${post.id}:`, error);
        }
    };

    // Function to process the posts in batches
    const processInBatches = async (instaAccountInst) => {
        let index = 0;

        while (index < posts.length) {
            const batch = posts.slice(index, index + concurrency).map(post => uploadSinglePhoto(instaAccountInst, post));
            await Promise.all(batch); // Wait for all uploads in the batch to complete
            index += concurrency;
        }
    };

    await processInBatches(instaAccountInst);
    console.log('Photo posted successfully!', response);
    return response;
};



const uploadPhotoToInstagram = async (instaAccountInst, imageUrl, caption) => {
    try {
        const imageBuffer = await get({
            url: imageUrl,
            encoding: null,
        });

        let igresp = await instaAccountInst.publish.photo({
            file: imageBuffer,
            caption: caption,
        });

        console.log('Photo posted successfully!', igresp);
        let userResp = parseIgUploadResponse(igresp);
        return userResp;
    } catch (error) {
        console.error('Failed to upload photo:', error);
    }
}

const postToInstagram = async (body) => {
    try {
        let postToPublish = await temporaryPostService.getPendingTemporaryPosts();
        if (postToPublish.length === 0) return { success: false, message: 'No posts to publish' };
        let timeToUploadAt = body.scheduleFrom ? new Date(body.scheduleFrom) : new Date();
        let timeDifference = body.timeDifference || intervalBetweenPosts;
        // Group posts by category ID
        postToPublish = postToPublish.reduce((acc, post) => {
            if (!acc[post.categoryId]) acc[post.categoryId] = [];
            acc[post.categoryId].push(post);
            return acc;
        }, {});

        let res = [];

        // Use for...of to handle async operations
        for (let categoryId of Object.keys(postToPublish)) {
            let categoryData = await categoryService.getCategoryById(categoryId);
            // let instaAccountInst = await loginToInstagram({ username: categoryData.email, password: categoryData.password });
            let categryPostingTime = new Date(timeToUploadAt);
            for (const post of postToPublish[categoryId]) {
                schedulePost(categoryData, post, categryPostingTime);
                console.log(`Scheduled post for category ${categoryId} at ${categryPostingTime.toLocaleString()}`);
                categryPostingTime = new Date(categryPostingTime.getTime() + timeDifference*60000)
            }

            // let uploadPhotoResponse = await uploadPhoto(instaAccountInst, postToPublish[categoryId]);
            // res.push({ categoryId, success: true, message: 'Photo posted successfully!', uploadPhotoResponse })
            res.push({ categoryId, success: true, message: 'Post scheduled successfully!' });
        }

        return res;  // Make sure to return the result
    } catch (error) {
        console.error('An error occurred during the posting process:', error);
        return { success: false, message: 'An error occurred during the posting process', error };
    }
};

const schedulePost = (categoryData, post, timeToPostOn) => {
    const postTime = new Date(timeToPostOn);
    schedule.scheduleJob(postTime, async () => {
        console.log(`Posting to Instagram for post id ${post.id} at ${post.scheduledOn}`);
        try {
            let instaAccountInst = await loginToInstagram({ username: categoryData.email, password: categoryData.password });
            await uploadPhoto(instaAccountInst, [post]);
        } catch (error) {
            console.error(`Failed to post to Instagram for post id ${post.id}:`, error);
        }
    });
}



const parseIgUploadResponse = (response) => {
    if(response.status !== 'ok') {
        return {
            success: false,
            message: 'Failed to upload photo to Instagram',
            data: response,
        };
    }
    return {
        success: true,
        message: 'Photo posted successfully!',
        uploadId: response.upload_id,
        data: response,
    };
}

module.exports = {
    postToInstagram,
    loginToInstagram,
    uploadPhoto,
};
