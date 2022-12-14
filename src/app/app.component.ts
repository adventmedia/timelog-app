import { Component } from '@angular/core';
import { pick } from 'lodash';
import { addMinutes, format } from 'date-fns';

interface ITimeSheet {
  project: string;
  start: string;
  end: string;
  date: string;
  duration: number;
  rate: number;
  note: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'TimelogApp';
  desiredInputHeaders = ['project', 'start', 'end', 'duration', 'rate', 'note'];
  timeSheet: ITimeSheet[] = [];
  fileName!: string;

  async openJSON() {
    // @ts-ignore
    const [fileHandle] = await window.showOpenFilePicker({
      description: 'JSON file',
      multiple: false,
      types: [
        {
          accept: {
            'text/plain': ['.json'],
          },
        },
      ],
      excludeAcceptAllOptions: true,
    });
    const file = await fileHandle.getFile();
    this.fileName = file.name;
    const contents = await file.text();
    this.JSONtoTabbedTxt(contents);
  }

  JSONtoTabbedTxt(dataStr: string) {
    const data = JSON.parse(dataStr);
    this.timeSheet = [];
    let prevNote = '';
    data.data.forEach((row: any) => {
      const sub = pick(row, this.desiredInputHeaders);
      sub['project'] = sub['project'].split(' ')[0];
      this.timeSheet.push(sub as ITimeSheet);
      const startDate = new Date(sub['start']);
      sub['date'] = format(startDate, 'yyyy-MM-dd');
      const stopDate = addMinutes(startDate, sub['duration']);
      sub['start'] = format(startDate, 'h:mm a');
      sub['end'] = format(stopDate, 'h:mm a');
      if (sub['note'].length === 0 && prevNote.length) {
        sub['note'] = prevNote;
      } else {
        prevNote = sub['note'];
      }
    });
  }

  async saveTxt() {
    const tab = '\t';
    const header = Object.keys(this.timeSheet[0]);
    const rows: string[] = [header.join(tab)];
    this.timeSheet.forEach((row, index) => {
      if (index > 0) {
        const rowArr = [];
        for (const k in row) {
          // @ts-ignore
          rowArr.push(row[k]);
        }
        rows.push(rowArr.join(tab));
      }
    });
   const contents = rows.join('\n');
   this.createAndSave(contents);
  }

  async createAndSave(contents: string) {
    const handle = await this.getNewFileHandle();
    handle && this.writeFile(handle, contents);
  }

  async getNewFileHandle() {
    const filename = this.fileName.split('.')[0] + '.txt';
    const options = {
      types: [
        {
          description: 'Text file',
          accept: {
            'text/plain': ['.txt'],
          },
        },
      ],
      suggestedName: filename,
    };
    // @ts-ignore
    const handle = await window.showSaveFilePicker(options);
    return handle;
  }

  async writeFile(fileHandle: any, contents: string) {
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  }
}
