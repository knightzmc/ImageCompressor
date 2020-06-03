const compress = require('compress-images')
const fs = require('fs')
const pino = require('pino')

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

const imageExtensions = ['png', 'jpg', 'svg', 'gif']

function logErr(err) {
    if (err) {
        logger.error(err);
        return
    }
}

function getFileSize(fileName, callback) {
    fs.exists(fileName, exists => {
        if (!exists) {
            callback(0)
            return
        }
        fs.lstat(fileName, (err, stats) => {
            logErr(err)
            if (stats) {
                callback(stats.size)
            }
        })
    })
}

if (process.env.NODE_ENV != 'dev') {
    console.log = function() {} //Fancy logging only 
}

const recentlyEdited = [];

const directory = process.env.npm_config_directory || '.'

fs.watch(directory, (_event, fileName) => {
    logger.debug("Incoming File %s", fileName)
    if (fileName.startsWith('.build/')) {
        logger.debug(`Ignoring file in build directory ${fileName}`)
        return
    }
    if (recentlyEdited.includes(fileName)) {
        logger.debug(`Ignoring recently edited file ${fileName}`)
        return
    }
    if (fileName.endsWith('.log')) {
        //Can't log a .log file, the logs will repeat forever!
        return
    }
    if (imageExtensions.filter(ext => fileName.endsWith(ext)).length == 0) {
        logger.debug(`Skipping file of type ${fileName.substring(fileName.lastIndexOf('.'))}`)
        return
    }

    recentlyEdited.push(fileName)
    fileName = `${directory}/${fileName}`

    function compareSize(previousSize, onFinish) {
        getFileSize(fileName, (size) => {
            logger.debug(`%s size: %d KB`, fileName, size)
            if (size === 0) {
                logger.debug("Size is 0. Assuming deleted file or more to be uploaded soon. Further checks must be prompted by watcher.")
                recentlyEdited.splice(recentlyEdited.indexOf(fileName))
                return
            }
            if (size !== previousSize) {
                logger.debug("Sizes do not match. Waiting 10ms...")
                setTimeout(() => {
                    compareSize(size, onFinish)
                }, 100);
            } else {
                logger.debug("Sizes match! %d - compressing...", size)
                onFinish()
            }
        })
    }

    compareSize(-1, () => {
        compress(fileName, '.build/', { statistic: true, autoupdate: true }, false, { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } }, { png: { engine: 'pngquant', command: ['--quality=20-50'] } }, { svg: { engine: 'svgo', command: '--multipass' } }, { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } },
            function(err, completed, statistic) {
                logErr(err)
                if (!completed) {
                    logger.warn('Completed var was falsey. Value: %s', completed)
                    return
                }

                fs.rename(statistic.path_out_new, fileName, () => {
                    logger.info('Successfully compressed file %s from %dKB to %dKB. %d\% File size reduction.', fileName, statistic.size_in, statistic.size_output, statistic.percent)
                    recentlyEdited.splice(recentlyEdited.indexOf(fileName))
                })
            })
    })
})