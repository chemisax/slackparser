/*

  Scan slack archive file and dump all the messages to a
  text file.

  (c) 2017 José María Campaña Rojas
  https://chemisax.com

*/

const colors = require('colors/safe');
const argv = require('minimist')(process.argv.slice(2));
const StreamZip = require('node-stream-zip');
const fs = require('fs');

console.log(colors.green('Slack archive parser v1.0.0'));

let input = argv.i;
let output = argv.o;

fs.writeFileSync(output, '');

if (typeof input !== 'string' && typeof output !== 'string') {
  console.log(colors.red('Input or output is not defined.'));
}

const appendLog = log => fs.appendFileSync(output, log);
const cleanMessage = m => m.replace(/<.*>/g, '');

console.log(colors.white(`Reading ${input}`));
const zip = new StreamZip({
    file: input,
    storeEntries: true
});

const processEntries = () => {
  for (const entry of Object.values(zip.entries())) {
      if (!entry.isDirectory) {
        if (/\d{4}-\d{2}-\d{2}.json$/.test(entry.name)) {
          parseEntry(entry);
        }
      }
  }
}

const parseEntry = entry => {
  const data = zip.entryDataSync(entry.name);
  const log = JSON.parse(data.toString('utf8'));
  parseLog(log);
};

const parseLog = entries => {
  entries.forEach(entry => {
      if (entry.type === 'message' && typeof entry.text === 'string') {
        appendLog(cleanMessage(entry.text));
      }
  });
};

zip.on('error', console.error);
zip.on('ready', () => {
    console.log(colors.white(`Working, please wait.`));
    processEntries();
    zip.close();
    console.log(colors.green(`${output} was created.`));
})
