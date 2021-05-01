const fs = require('fs');
const path = require('path');

// Data module -> module Scaffolding
const libData = {};

// Retrieve the base directory of .data folder
libData.baseDir = path.join(__dirname, '/../.data/');


/**
 * Method of write new data to the file
 *
 * @param dir
 * @param fileName
 * @param data
 * @param callback
 */
libData.create = (dir, fileName, data, callback) => {
    // Generate the filename with location
    const generateFilePath = `${libData.baseDir}${dir}/${fileName}.json`;

    // At first open the file for writing
    fs.open(generateFilePath, 'wx', (err1, fileDescriptor) => {
        if (!err1 && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Write data to the file and close it
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if (!err2) {
                    // After write the data close the file
                    fs.close(fileDescriptor, (err3) => {
                        if (!err3) {
                            callback(null, 'The file write successfully');
                        } else {
                            callback(true, 'Error to closing the new file');
                        }

                    })
                } else {
                    callback(true, 'Error writing to new file!');
                }
            })
        } else {
            callback(true, 'Sorry! failed to create file, it may already exists!');
        }
    })
}

/**
 * Method to read the file
 *
 * @param dir
 * @param fileName
 * @param callback
 */
libData.read = (dir, fileName, callback) => {
    // Generate the filename with location
    const generateFilePath = `${libData.baseDir}${dir}/${fileName}.json`;

    // Read the file
    fs.readFile(generateFilePath, 'utf8', (err, data) => {
        callback(err, data);
    })
}

/**
 * Method to update existing file
 *
 * @param dir
 * @param fileName
 * @param data
 * @param callback
 */
libData.update = (dir, fileName, data, callback) => {
    // Generate the filename with location
    const generateFilePath = `${libData.baseDir}${dir}/${fileName}.json`;

    // At first open the file for writing
    fs.open(generateFilePath, 'r+', (err1, fileDescriptor) => {
        if (!err1 && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Write data to the file and close it
            fs.ftruncate(fileDescriptor, (err2) => {
                if (!err2) {
                    // Write to the file
                    fs.writeFile(fileDescriptor, stringData, (err3) => {
                        if (!err3) {
                            // Close the file
                            fs.close(fileDescriptor, (err3) => {
                                if (!err3) {
                                    callback(null, 'The file write successfully');
                                } else {
                                    callback(true, 'Error to closing the new file');
                                }

                            });
                        } else {
                            callback(true, 'Error writing file');
                        }
                    });

                } else {
                    callback(true, 'Error truncating file');
                }

            });
        } else {
            callback(true, 'Error updating, file may not exists!');
        }

    })
}

/**
 * Method to delete a file
 *
 * @param dir
 * @param fileName
 * @param callback
 */
libData.delete = (dir, fileName, callback) => {
    // Generate the filename with location
    const generateFilePath = `${libData.baseDir}${dir}/${fileName}.json`;

    // Unlink or delete the file
    fs.unlink(generateFilePath, (err) => {
        if (!err) {
            callback(null, 'The file deleted successfully');
        } else {
            callback(true, 'Failed to delete the file');
        }
    })
}

/**
 * Method to get all the filenames in a directory
 *
 * @param dir
 * @param callback
 */
libData.list = (dir, callback) => {
    const generateFolderPath = `${libData.baseDir}${dir}/`;

    fs.readdir(generateFolderPath, (err, fileNames) => {
        if (!err && fileNames && fileNames.length > 0) {
            const trimmedFileNames = [];
            fileNames.forEach(filename => {
                trimmedFileNames.push(filename.replace('.json', ''));
            })

            callback(false, trimmedFileNames);
        } else {
            callback('Error to reading the directory');
        }
    })
}

module.exports = libData;