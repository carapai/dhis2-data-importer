import XLSX from 'xlsx';
self.addEventListener("message", startCounter); // eslint-disable-line no-restricted-globals

async function startCounter(event) {

    const files = event.data;
    let buffers = [];

    [].forEach.call(files, function (file) {
        const reader = new FileReaderSync();
        buffers.push(reader.readAsArrayBuffer(file));
    });


    const data = buffers[0];

    const workbook = XLSX.read(data, {
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
    });


    this.postMessage(workbook);
}
