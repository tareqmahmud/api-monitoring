// Config Module -> App Scaffolding
const environment = {};

/**
 * Stage config
 *
 * @type {{}}
 */
environment.staging = {
    port: 3000,
    environment: 'staging'
}


/**
 * Production config
 *
 * @type {{}}
 */
environment.production = {
    port: 3000,
    environment: 'production'
}

// Generate the specific config

// At first check what is the current environment
// If environment variable is missing the set default staging environment
const currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

// Now fetch the actual environment using current environment
const config = typeof (environment[currentEnvironment]) === 'object' ? environment[currentEnvironment] : environment.staging;

module.exports = config;