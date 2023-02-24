import express from 'express'
import glob from 'glob'
import path from 'path'

const app = express()

var layers = ["terrain", "res", "entity", "item"]
var els = []
layers.forEach((layer) => {
    //console.log(layer)
    let files =glob.sync("./src/" + layer + "/**/*.js")
    files.forEach((file) => {
        //console.log(file)
        els.push({filename:"." + file.substring(5), name:path.parse(path.basename(file)).name})
    })
})

app.use(express.static('src'));
app.get('/imports.js', function (req, res) {
    res.setHeader('content-type', 'text/javascript');
    var importFile = ''
    els.forEach((element) => { 
        importFile += 'import * as ' + element.name + ' from "'  + element.filename  + '"\r\n'
    })
    importFile += 'var elements = ['
    els.forEach((element) => { 
        importFile += element.name  + ', '
    })
    importFile += ']\r\n'
    importFile += 'export default elements'
    //console.log(importFile)
    res.send(importFile)
  })
  

app.listen(8080)
