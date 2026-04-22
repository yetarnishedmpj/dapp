import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const path = require('path');

// Dynamically load the C++ addon based on environment
const addonPath = path.resolve('./build/Release/metadata_utils.node');
const metadataAddon = require(addonPath);

export const validateAndHashMetadata = (name, description) => {
    try {
        const hash = metadataAddon.validateAndHash(name, description);
        return { success: true, hash };
    } catch (e) {
        return { success: false, error: e.message };
    }
};
