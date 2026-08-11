'use strict';

/**
 * vehicle-id service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::vehicle-id.vehicle-id');
