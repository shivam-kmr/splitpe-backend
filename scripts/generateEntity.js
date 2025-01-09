const fs = require('fs');
const path = require('path');

const createFile = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
};

const generateFiles = (entityName) => {
  const entity = entityName.toLowerCase();
  const Entity = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  const files = {
    controller: `../src/controllers/${entity}.controller.js`,
    model: `../src/models/${entity}.model.js`,
    route: `../src/routes/v1/${entity}.route.js`,
    service: `../src/services/${entity}.service.js`,
    validation: `../src/validations/${entity}.validation.js`,
  };

  const boilerplate = {
    controller: `
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { ${entity}Service } = require('../services');

const create${Entity} = catchAsync(async (req, res) => {
  const ${entity} = await ${entity}Service.create${Entity}(req.body);
  res.status(httpStatus.CREATED).send(${entity});
});

const get${Entity}s = catchAsync(async (req, res) => {
  const result = await ${entity}Service.query${Entity}s(req.query);
  res.send(result);
});

const get${Entity} = catchAsync(async (req, res) => {
  const ${entity} = await ${entity}Service.get${Entity}ById(req.params.${entity}Id);
  if (!${entity}) {
    throw new Error('Not found');
  }
  res.send(${entity});
});

const update${Entity} = catchAsync(async (req, res) => {
  const ${entity} = await ${entity}Service.update${Entity}ById(req.params.${entity}Id, req.body);
  res.send(${entity});
});

const delete${Entity} = catchAsync(async (req, res) => {
  await ${entity}Service.delete${Entity}ById(req.params.${entity}Id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  create${Entity},
  get${Entity}s,
  get${Entity},
  update${Entity},
  delete${Entity},
};
    `,
    model: `
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const ${entity}Schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

${entity}Schema.plugin(toJSON);
${entity}Schema.plugin(paginate);

const ${Entity} = mongoose.model('${Entity}', ${entity}Schema);
module.exports = ${Entity};
    `,
    route: `
const express = require('express');
const validate = require('../../middlewares/validate');
const ${entity}Validation = require('../../validations/${entity}.validation');
const ${entity}Controller = require('../../controllers/${entity}.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(${entity}Validation.create${Entity}), ${entity}Controller.create${Entity})
  .get(${entity}Controller.get${Entity}s);

router
  .route('/:${entity}Id')
  .get(${entity}Controller.get${Entity})
  .patch(validate(${entity}Validation.update${Entity}), ${entity}Controller.update${Entity})
  .delete(${entity}Controller.delete${Entity});

module.exports = router;
    `,
    service: `
const { ${entity} } = require('../models');

const create${Entity} = async (data) => {
  return ${entity}.create(data);
};

const query${Entity}s = async (filter) => {
  return ${entity}.find(filter);
};

const get${Entity}ById = async (id) => {
  return ${entity}.findById(id);
};

const update${Entity}ById = async (id, updateBody) => {
  return ${entity}.findByIdAndUpdate(id, updateBody, { new: true });
};

const delete${Entity}ById = async (id) => {
  return ${entity}.findByIdAndDelete(id);
};

module.exports = {
  create${Entity},
  query${Entity}s,
  get${Entity}ById,
  update${Entity}ById,
  delete${Entity}ById,
};
    `,
    validation: `
const Joi = require('joi');

const create${Entity} = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
  }),
};

const update${Entity} = {
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
  }),
};

module.exports = {
  create${Entity},
  update${Entity},
};
    `,
  };

  for (const [type, filePath] of Object.entries(files)) {
    createFile(filePath, boilerplate[type]);
    console.log(`${type} file created: ${filePath}`);
  }
};

const entityName = process.argv[2];
if (!entityName) {
  console.error('Please provide an entity name!');
  process.exit(1);
}

generateFiles(entityName);
