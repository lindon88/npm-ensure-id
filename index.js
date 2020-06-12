'use strict';
const htmlparser = require("htmlparser2");
const replace = require('replace-in-file');
const camelCase = require('lodash.camelcase');
const fs = require('fs');
var path = require('path');

module.exports = function checkHtml(_options, _dir) {

    var files = recFindByExt(_dir, 'html');
    var options = {
        check: 'ng-attr-id',
        elements: ['button', 'a', 'input', 'select'],
        attrs: ['ng-click', 'ng-submit'],
        autofix: false
    };

    if (_options) options = _options;

    var currentFile, hasError = false, currentLine, index, countFile = 0, uniqueId = 0;
    var parser = new htmlparser.Parser({
        onopentag: parseOpenTag
    }, {decodeEntities: true});
    console.log('Found ' + files.length + ' file groups to check');

    files.forEach(function (f) {
        console.log(f);
        if(filterNonExistingFiles(f)){
            parseFile(f);
        }
        // f.filter(filterNonExistingFiles).map(parseFile);
    });

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
                    var nameFile = camelCase(regExpFileName.exec(currentFile.replace(/\.html/g, '')));

                    /* replace the special characters of the html tag to be able to use it with regular expressions */
                    var copyCurrentLine = currentLine;
                    copyCurrentLine = copyCurrentLine.replace(/\"/g, '\\"');
                    copyCurrentLine = copyCurrentLine.replace(/\./g, '\\.');
                    copyCurrentLine = copyCurrentLine.replace(/\//g, '\\/');
                    copyCurrentLine = copyCurrentLine.replace(/\(/g, '\\(');
                    copyCurrentLine = copyCurrentLine.replace(/\)/g, '\\)');
                    copyCurrentLine = copyCurrentLine.replace(/\|/g, '\\|');
                    var regexString = new RegExp(copyCurrentLine);

                    switch (name) {
                        case 'button':
                            var newId = nameFile + "_btn_" + countFile + "_" + uniqueId;
                            break;

                        case 'img':
                            var newId = nameFile + "_img_" + countFile + "_" + uniqueId;
                            break;

                        case 'p':
                            var newId = nameFile + "_text_" + countFile + "_" + uniqueId;
                            break;

                        case 'span':
                            var newId = nameFile + "_span_" + countFile + "_" + uniqueId;
                            break;

                        case 'a':
                            var newId = nameFile + "_link_" + countFile + "_" + uniqueId;
                            break;

                        case 'input':
                            var newId = "{{'" + nameFile + "_link_' + " + nameFile + ".index + '_' \| uniqueId }}";
                            break;

                        case 'iframe':
                            var newId = nameFile + "_iframe_" + countFile + "_" + uniqueId;
                            break;

                        default:
                            var newId = nameFile + "_other_" + countFile + "_" + uniqueId;
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
                    var nameFile = camelCase(regExpFileName.exec(currentFile.replace(/\.html/g, '')));

                    /* replace the special characters of the html tag to be able to use it with regular expressions */
                    var copyCurrentLine = currentLine;
                    copyCurrentLine = copyCurrentLine.replace(/\"/g, '\\"');
                    copyCurrentLine = copyCurrentLine.replace(/\./g, '\\.');
                    copyCurrentLine = copyCurrentLine.replace(/\//g, '\\/');
                    copyCurrentLine = copyCurrentLine.replace(/\(/g, '\\(');
                    copyCurrentLine = copyCurrentLine.replace(/\)/g, '\\)');
                    copyCurrentLine = copyCurrentLine.replace(/\|/g, '\\|');
                    var regexString = new RegExp(copyCurrentLine);

                    switch (attribute) {
                        case 'ng-click':
                            var newId = nameFile + "_btn_" + countFile + "_" + uniqueId;
                            break;
                        case 'ng-submit':
                            var newId = nameFile + "_btn_" + countFile + "_" + uniqueId;
                            break;
                        default:
                            var newId = nameFile + "_other_" + countFile + "_" + uniqueId;
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
