fs = require 'fs'
funcflow = require 'funcflow'
_ = require 'underscore'

createBuildSteps=(fileName)->
    return [
        (step, err, file)->compile("./src/#{fileName}.coffee", step.options.minify, step.next)
        (step, err, file)->writeFile("./lib/#{fileName}#{if step.options.minify then '.min' else ''}.js", file, step.next)
        (step, err)->
            console.log("Compiled '#{fileName}#{if step.options.minify then '.min' else ''}.js'!")
            step.next()
    ]
buildSteps = _.flatten([createBuildSteps('durable-json-lint'),createBuildSteps('durable-json-lint-with-dependencies')])

testSteps = [
    (step, err, file)->compile('./tests/tests.coffee', false, step.next)
    (step, err, file)->writeFile('./tests/tests.js', file, step.next)
    (step, err)->
        console.log('Compiled "tests.js"!')
        console.log('Running "tests.js"!')
        test('./tests/tests.js', step.options.exception, step.next)
    (step, err)->
        console.log('Ran "tests.js"!')
]

task 'build', 'compiles src/unify.coffee to lib/unify.js', (options)->
    options.minify = false
    funcflow(buildSteps, {catchExceptions:false, "options":options}, ()->)

task 'build:min', 'compiles src/unify.coffee to lib/unify.js and then runs UglifyJS on it', (options)->
    options.minify = true
    funcflow(buildSteps, {catchExceptions:false, "options":options}, ()->)

option '-e', '--exception', "don't catch exceptions when running unit tests"
task 'build:full', 'compiles src/unify.coffee, runs all tests, and minifies', (options)->
    options.minify = false
    funcflow(_.flatten([
        buildSteps
        (step,err)->
            step.options.minify = true
            step.next()
        buildSteps
        testSteps
    ]),{catchExceptions:false, "options":options}, ()->)
    
task 'test', 'compiles src/unify.coffee to lib/unify.js and then runs all the unit tests', (options)->
    funcflow(buildSteps.concat(testSteps), {catchExceptions:false, "options":options}, ()->)
    
compile = (inputFilePath, minify, callback) ->
    Snockets = require('snockets')
    (new Snockets()).getConcatenation(inputFilePath, {minify:minify}, 
        (err,file)->
            if err then throw err
            callback(file))

compress = (inputFile, callback) ->
    UglifyJS = require "uglify-js"
    toplevel = UglifyJS.parse(inputFile)
    toplevel.figure_out_scope()
    compressor = UglifyJS.Compressor()
    compressed_ast = toplevel.transform(compressor)
    compressed_ast.figure_out_scope()
    compressed_ast.compute_char_frequency()
    compressed_ast.mangle_names()
    callback?(compressed_ast.print_to_string())
    
readFile = (filename, callback) ->
    data = fs.readFile(filename, 'utf8', (err, data)-> if err then throw err else callback(data))
 
writeFile = (filename, data, callback) ->
    fs.writeFile(filename, data, 'utf8', (err)-> if err then throw err else callback())

test = (inputFile, throwException, callback) ->
    tests = require(inputFile)
    #tests["simple no var bind test"]()
    tests.RunAll(throwException)
    callback()