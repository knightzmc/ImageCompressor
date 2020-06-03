# ImageCompressor

ImageCompressor is a tiny Node service I use to compress any screenshots uploaded to my server.

It is a simple CLI that watches a directory for any new image files, and compresses them if applicable.

ImageCompressor supports 4 main file types:

1. PNG
2. JPEG
3. SVG
4. GIF

and uses [compress-images](https://www.npmjs.com/package/compress-images) to handle image compression.


## Functionality

ImageCompressor was built with a specific requirement set:
**Watch a directory for new images that will be uploaded via SFTP, and compress them automatically**

From testing, this is achieved well. 
Checks are done to respect the updating of files as they upload, and the tool performs well,
with absolutely no blocking code (all work is done asynchronously via callbacks).

Images are compressed effectively, with an average size reduction of ~60% 
(although this is not an achievement of ImageCompressor, moreso the compression tools made by talented developers)

ImageCompressor is also lightweight, with very few NPM dependencies.
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


## Future Plans and Feedback

- [ ] Store uncompressed images?
- [ ] Improve the logging, writing to both a file and `stdout`
- [ ] Clean up the code, split into separate files, etc

I am not overly familiar with JavaScript and Node, so some conventions may have been broken here. Feedback is appreciated and any PRs are very welcome!
