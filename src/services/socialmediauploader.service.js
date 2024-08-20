const { IgApiClient, IgCheckpointError, IgLoginTwoFactorRequiredError } = require('instagram-private-api');
const inquirer = require('inquirer');
const { get } = require('request-promise');

const temporaryPostService = require('./temporarypost.service');

const ig = new IgApiClient();

const loginToInstagram = async () => {
    ig.state.generateDevice(process.env.IG_USERNAME);
    // ig.state.proxyUrl = process.env.IG_PROXY;

    try {
        const auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
        console.log('Logged in:', auth);
        return auth;
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

            const auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
            console.log('Logged in after challenge:', auth);
            return auth;

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
            return auth;

        } else {
            console.error('Failed to login:', error);
            throw error;
        }
    }
};

const uploadPhoto = async (posts) => {
    const concurrency = 10; // Set your desired concurrency level
    let response = [];

    // Function to handle the upload for a single post
    const uploadSinglePhoto = async (post) => {
        let imageUrl = post.mediaUrl;
        let caption = post.caption + "\n" + post.hashtags;

        try {
            let igresp = await uploadPhotoToInstagram(imageUrl, caption);
            if (igresp.success) {
                await temporaryPostService.updateTemporaryPostById(post.id, { status: 'published', uploadId: igresp.uploadId });
            }
            response.push({ id: post.id, uploadId: igresp.uploadId, success: igresp.success, message: igresp.message });
        } catch (error) {
            console.error(`Failed to upload photo for post ${post.id}:`, error);
        }
    };

    // Function to process the posts in batches
    const processInBatches = async () => {
        let index = 0;

        while (index < posts.length) {
            const batch = posts.slice(index, index + concurrency).map(post => uploadSinglePhoto(post));
            await Promise.all(batch); // Wait for all uploads in the batch to complete
            index += concurrency;
        }
    };

    await processInBatches();
    console.log('Photo posted successfully!', response);
    return response;
};



const uploadPhotoToInstagram = async (imageUrl, caption) => {
    try {
        const imageBuffer = await get({
            url: imageUrl,
            encoding: null,
        });

        let igresp = await ig.publish.photo({
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

const postToInstagram = async () => {
    try {
        let postToPublish = await temporaryPostService.getPendingTemporaryPosts();
        if(postToPublish.length === 0) return { success: false, message: 'No posts to publish' };
        await loginToInstagram();
        return await uploadPhoto(postToPublish);
    } catch (error) {
        console.error('An error occurred during the posting process:', error);
    }
};


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