const compress = require('compress-images')
const fs = require('fs')
const pino = require('pino')

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const imageExtensions = ['png', 'jpg', 'jpg']

function logErr(err) {
    if (err) {
        logger.error(err);
        return
    }
}

function getFileSize(fileName, callback) {
    fs.lstat(fileName, (err, stats) => {
        logErr(err)
        callback(stats.size)
    })
}

console.log = function() {} //Fancy logging only 
const recentlyEdited = [];

function scheduleRemoval(array, value) {
    setTimeout(() => {
        array.splice(array.indexOf(value))
    }, 1000);
}

fs.watch('.', (event, fileName) => {
    if (fileName.startsWith('build/')) {
        logger.debug(`Ignoring file in build directory ${fileName}`)
        return
    }
    if (recentlyEdited.includes(fileName)) {
        logger.debug(`Ignoring recently edited file ${fileName}`)
        return
    }
    if (!fs.existsSync(fileName)) {
        logger.debug(`Ignoring deleted file ${fileName}`)
        return
    }
    if (fileName.endsWith('.log')) {
        //Can't log a .log file, can repeat forever! 
        return
    }
    if (imageExtensions.filter(ext => fileName.endsWith(ext)).length == 0) {
        logger.debug(`Skipping file of type ${fileName.substring(fileName.lastIndexOf('.'))}`)
        return
    }

    recentlyEdited.push(fileName)
    scheduleRemoval(recentlyEdited, fileName)

    compress(fileName, '.build/', { statistic: true, autoupdate: true }, false, { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } }, { png: { engine: 'pngquant', command: ['--quality=20-50'] } }, { svg: { engine: 'svgo', command: '--multipass' } }, { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } },
        function(err, completed, statistic) {
            logErr(err)
            if (!completed) {
                logger.warn('Completed var was falsey. Value: %s', completed)
                return
            }

            let outName = statistic.path_out_new
            recentlyEdited.push(outName)

            fs.rename(outName, fileName, () => {
                logger.info('Successfully compressed file %s from %dKB to %dKB. %d\% File size reduction.', fileName, statistic.size_in, statistic.size_output, statistic.percent)
                recentlyEdited.pop() //Removes `outName` from the array
            })
        })
})