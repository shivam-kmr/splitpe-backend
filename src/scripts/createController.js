const fs = require('fs');
const path = require('path');

const entityName = process.argv[2];

if (!entityName) {
    console.error('Please provide an entity name');
    process.exit(1);
}

try {
    const modelTemplate = `
const mongoose = require('mongoose');

const ${entityName.toLowerCase()}Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  // You can add more fields as per your requirements
});

const ${entityName} = mongoose.model('${entityName}', ${entityName.toLowerCase()}Schema);

module.exports = ${entityName};
`;

    const routeTemplate = `
const express = require('express');
const validate = require('../../middlewares/validate');
const ${entityName.toLowerCase()}Validation = require('../../validations/${entityName.toLowerCase()}.validations');
const ${entityName.toLowerCase()}Controller = require('../../controllers/${entityName.toLowerCase()}.controller');

const router = express.Router();

router.post('/', validate(${entityName.toLowerCase()}Validation.create${entityName}), ${entityName.toLowerCase()}Controller.create${entityName});
router.get('/', ${entityName.toLowerCase()}Controller.getAll${entityName}s);
router.get('/:${entityName.toLowerCase()}Id', ${entityName.toLowerCase()}Controller.get${entityName}ById);
router.put('/:${entityName.toLowerCase()}Id', validate(${entityName.toLowerCase()}Validation.update${entityName}), ${entityName.toLowerCase()}Controller.update${entityName});
router.delete('/:${entityName.toLowerCase()}Id', ${entityName.toLowerCase()}Controller.delete${entityName}ById);

module.exports = router;
`;

    const serviceTemplate = `
const ${entityName} = require('../models/${entityName.toLowerCase()}.model');

const create${entityName} = async (${entityName.toLowerCase()}Body) => {
  return ${entityName}.create(${entityName.toLowerCase()}Body);
};

const getAll${entityName}s = async () => {
  return ${entityName}.find();
};

const get${entityName}ById = async (${entityName.toLowerCase()}Id) => {
  return ${entityName}.findById(${entityName.toLowerCase()}Id);
};

const update${entityName} = async (${entityName.toLowerCase()}Id, updateBody) => {
  return ${entityName}.findByIdAndUpdate(${entityName.toLowerCase()}Id, updateBody, { new: true });
};

const delete${entityName} = async (${entityName.toLowerCase()}Id) => {
  return ${entityName}.findByIdAndDelete(${entityName.toLowerCase()}Id);
};

module.exports = {
  create${entityName},
  getAll${entityName}s,
  get${entityName}ById,
  update${entityName},
  delete${entityName},
};
`;

    const validationTemplate = `
const Joi = require('joi');

const create${entityName} = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    // Add more validations as needed
  }),
};

const update${entityName} = {
  params: Joi.object().keys({
    ${entityName.toLowerCase()}Id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    phoneNumber: Joi.string(),
    // Add more validations as needed
  }),
};

module.exports = {
  create${entityName},
  update${entityName},
};
`;

    const controllerTemplate = `
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { ${entityName.toLowerCase()}Service } = require('../services');

const create${entityName} = catchAsync(async (req, res) => {
  const ${entityName.toLowerCase()} = await ${entityName.toLowerCase()}Service.create${entityName}(req.body);
  res.status(httpStatus.CREATED).send(${entityName.toLowerCase()});
});

const getAll${entityName}s = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['category']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await ${entityName.toLowerCase()}Service.query${entityName}s(filter, options);
  res.send(result);
});

const get${entityName}ById = catchAsync(async (req, res) => {
  const ${entityName.toLowerCase()} = await ${entityName.toLowerCase()}Service.get${entityName}ById(req.params.${entityName.toLowerCase()}Id);
  if (!${entityName.toLowerCase()}) {
    throw new ApiError(httpStatus.NOT_FOUND, '${entityName} not found');
  }
  res.send(${entityName.toLowerCase()});
});

const update${entityName} = catchAsync(async (req, res) => {
  const ${entityName.toLowerCase()} = await ${entityName.toLowerCase()}Service.update${entityName}ById(req.params.${entityName.toLowerCase()}Id, req.body);
  res.send(${entityName.toLowerCase()});
});

const delete${entityName}ById = catchAsync(async (req, res) => {
  await ${entityName.toLowerCase()}Service.delete${entityName}ById(req.params.${entityName.toLowerCase()}Id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  create${entityName},
  getAll${entityName}s,
  get${entityName}ById,
  update${entityName},
  delete${entityName}ById,
};
`;

    const directories = [
        { dir: '../models', file: `${entityName.toLowerCase()}.model.js`, content: modelTemplate },
        { dir: '../routes/v1', file: `${entityName.toLowerCase()}.route.js`, content: routeTemplate },
        { dir: '../services', file: `${entityName.toLowerCase()}.service.js`, content: serviceTemplate },
        { dir: '../validations', file: `${entityName.toLowerCase()}.validations.js`, content: validationTemplate },
        { dir: '../controllers', file: `${entityName.toLowerCase()}.controller.js`, content: controllerTemplate },
    ];

    directories.forEach(({ dir, file, content }) => {
        const filePath = path.join(__dirname, dir, file);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, content.trim());
        console.log(`File created at ${filePath}`);
    });

} catch (error) {
    console.error(`Error creating files: ${error.message}`);
    process.exit(1);
}
