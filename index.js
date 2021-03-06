'use strict';
const htmlparser = require("htmlparser2");
const replace = require('replace-in-file');
const camelCase = require('lodash.camelcase');
const fs = require('fs');
var path = require('path');
var uniqid = require('uniqid');
var minify = require('html-minifier').minify;

module.exports = function checkHtml(_options, _dir) {

    var options = {
        check: 'ng-attr-id',
        elements: ['button', 'a', 'input', 'select'],
        attrs: ['ng-click', 'ng-submit'],
        autofix: false,
        platform: 'web'
    };

    if (_options) options = _options;

    var currentFile, hasError = false, currentLine, index, countFile = 0, uniqueId = 0;
    var parser = new htmlparser.Parser({
        onopentag: parseOpenTag
    }, {decodeEntities: true});

    if(fs.lstatSync(_dir).isDirectory()){
        var files = recFindByExt(_dir, 'html');
        console.log('Found ' + files.length + ' file groups to check');
        files.forEach(function (f) {
            console.log(f);
            if(filterNonExistingFiles(f)){
                parseFile(f);
            }
            // f.filter(filterNonExistingFiles).map(parseFile);
        });
    }else if(fs.existsSync(_dir) && fs.lstatSync(_dir).isFile()) {
        parseFile(_dir);
    }

    parser.end();
    if (hasError) {
        console.error('Found elements without -> ' + options.check + '.');
    }

    function recFindByExt(base,ext,files,result)
    {
        files = files || fs.readdirSync(base)
        result = result || []

        files.forEach(
            function (file) {
                var newbase = path.join(base,file)
                if ( fs.statSync(newbase).isDirectory() )
                {
                    result = recFindByExt(newbase,ext,fs.readdirSync(newbase),result)
                }
                else
                {
                    if ( file.substr(-1*(ext.length+1)) == '.' + ext )
                    {
                        result.push(newbase)
                    }
                }
            }
        )
        return result
    }

    function filterNonExistingFiles(filepath) {
        // !grunt.file.exists(filepath)
        if (!fs.existsSync(filepath)) {
            console.warn('Source file "' + filepath + '" not found.');
            return false;
        } else {
            return true;
        }
    }

    function parseFile(filepath) {
        console.log('Checking file: ' + filepath);
        currentFile = filepath;
        var lines = fs.readFileSync(filepath, {encoding: 'utf8'});
        index = 1;
        lines.split('\n').forEach(function (line) {
            currentLine = line.replace('\r', '');
            parser.parseComplete(currentLine);
            index++;
        });
        console.log('Finished file: ' + filepath);
        countFile++;
    }

    function parseOpenTag(name, attribs) {
        if (options.elements.indexOf(name) !== -1) {
            if (!attribs.hasOwnProperty(options.check)) {
                if (options.autofix) {

                    /* convert name file to camelCase */
                    var regExpFileName = new RegExp(/[^/]*$/g);

                    console.log(currentFile);

                    // var nameFile = camelCase(regExpFileName.exec(currentFile.replace(/\.html/g, '')));
                    var nameFile = options.platform;

                    /* replace the special characters of the html tag to be able to use it with regular expressions */
                    var copyCurrentLine = currentLine;
                    copyCurrentLine = copyCurrentLine.replace(/\"/g, '\\"');
                    copyCurrentLine = copyCurrentLine.replace(/\./g, '\\.');
                    copyCurrentLine = copyCurrentLine.replace(/\//g, '\\/');
                    copyCurrentLine = copyCurrentLine.replace(/\(/g, '\\(');
                    copyCurrentLine = copyCurrentLine.replace(/\)/g, '\\)');
                    copyCurrentLine = copyCurrentLine.replace(/\$/g, '\\$');
                    copyCurrentLine = copyCurrentLine.replace(/\|/g, '\\|');
                    var regexString = new RegExp(copyCurrentLine);

                    switch (name) {
                        case 'button':
                            var newId = uniqid(nameFile + "-btn-");
                            break;

                        case 'img':
                            var newId = uniqid(nameFile + "-img-");
                            break;

                        case 'p':
                            var newId = uniqid(nameFile + "-text-");
                            break;

                        case 'span':
                            var newId = uniqid(nameFile + "-span-");
                            break;

                        case 'a':
                            var newId = uniqid(nameFile + "-link-");
                            break;

                        case 'input':
                            var newId = uniqid(nameFile + "-input-");
                            break;

                        case 'iframe':
                            var newId = uniqid(nameFile + "-iframe-");
                            break;

                        default:
                            var newId = uniqid(nameFile + "-" + name + "-");
                            break;
                    }
                    uniqueId++;

                    /* Prepare options to replace file */
                    var replaceOptions = {
                        files: currentFile,
                        from: regexString,
                        to: currentLine.replace('<' + name, '\<' + name + ' ' + options.check + '="' + newId + '"')
                    };

                    try {
                        let changedFiles = replace.sync(replaceOptions);
                        console.log(currentFile + ' [AUTO FIX] Line ' + index + ': (' + name + ' -> without: ' + options.check + ')' + currentLine);
                    } catch (error) {
                        console.log('Error occurred:', error);
                    }
                    hasError = false;
                } else {
                    console.warn(currentFile + ' Line ' + index + ': (' + name + ' -> without: ' + options.check + ')' + currentLine);
                    hasError = true;
                }
            }
        }

        options.attrs.forEach(function (attribute) {
            if (attribs.hasOwnProperty(attribute) && !attribs.hasOwnProperty(options.check)) {

                if (options.autofix) {

                    /* convert name file to camelCase */
                    var regExpFileName = new RegExp(/[^/]*$/g);
                    // var nameFile = camelCase(regExpFileName.exec(currentFile.replace(/\.html/g, '')));
                    var nameFile = options.platform;

                    /* replace the special characters of the html tag to be able to use it with regular expressions */
                    var copyCurrentLine = currentLine;
                    copyCurrentLine = copyCurrentLine.replace(/\"/g, '\\"');
                    copyCurrentLine = copyCurrentLine.replace(/\./g, '\\.');
                    copyCurrentLine = copyCurrentLine.replace(/\$/g, '\\$');
                    copyCurrentLine = copyCurrentLine.replace(/\//g, '\\/');
                    copyCurrentLine = copyCurrentLine.replace(/\(/g, '\\(');
                    copyCurrentLine = copyCurrentLine.replace(/\)/g, '\\)');
                    copyCurrentLine = copyCurrentLine.replace(/\|/g, '\\|');
                    var regexString = new RegExp(copyCurrentLine);

                    switch (attribute) {
                        case 'ng-click':
                            var newId = uniqid(nameFile + "-btn-");
                            break;
                        case 'ng-submit':
                            var newId = uniqid(nameFile + "-btn-");
                            break;
                        default:
                            var newId = uniqid(nameFile + "-other-");
                            break;
                    }
                    uniqueId++;

                    /* Prepare options to replace file */
                    var replaceOptions = {
                        files: currentFile,
                        from: regexString,
                        to: currentLine.replace('<' + name, '\<' + name + ' ' + options.check + '="' + newId + '"')
                    };

                    try {
                        let changedFiles = replace.sync(replaceOptions);
                        console.log(currentFile + ' [AUTO FIX] Line ' + index + ': (' + name + ' with ' + attribute + ' -> without: ' + options.check + ')' + currentLine);
                    } catch (error) {
                        console.log('Error occurred:', error);
                    }
                    hasError = false;
                } else {
                    console.warn(currentFile + ' Line ' + index + ': (' + name + ' with ' + attribute + ' -> without: ' + options.check + ')' + currentLine);
                    hasError = true;
                }

            }
        });
    }
};
