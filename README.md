# ImageCompressor

ImageCompressor is a tiny Node service I use to compress any screenshots uploaded to my server.

It is a simple CLI that watches a directory for any new image files, and compresses them if applicable.

ImageCompressor supports 4 main file types:

1. png
2. jpg
3. svg
4. gif

and uses [compress-images](https://www.npmjs.com/package/compress-images) to handle image compression.


## Usage

Using ImageCompressor is trivial:

`npm start` - starts ImageCompressor watching the working directory

`npm start --directory=/some/dir/here` - Starts ImageCompressor watching a given directory

`npm run debug [--directory]` - Starts ImageCompressor in debug mode. More logging info will be given.



## Directories

ImageCompressor uses 3 main directories:

1. The watched directory. This defaults to the working directory or can be specified as shown above.
2. The `logs` directory. All logs are piped to here via the start script, into either `info.log` or `error.log`. [Pino](https://github.com/pinojs/pino) is used for pretty log messages (however colours may not display properly in a file).
3. The `.build` directory. This is a hidden directory used to store compressed copies of images. Once compression completes, these copies are removed.
