'use strict';

/**
 * answer-history service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::answer-history.answer-history');
