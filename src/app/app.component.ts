import { Component } from '@angular/core';
import { pick } from 'lodash';
import { addMinutes, format } from 'date-fns';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'TimelogApp';
  desiredInputHeaders = ['project', 'start', 'end', 'duration', 'rate', 'note'];

  async openJSON() {
    // @ts-ignore
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    this.JSONtoTabbedTxt(contents);
  }

  JSONtoTabbedTxt(dataStr: string) {
    const data = JSON.parse(dataStr);
    const dataSet: Pick<any, string>[] = [];
    data.data.forEach((row: any) => {
      const sub = pick(row, this.desiredInputHeaders);
      sub['project'] = sub['project'].split(' ')[0];
      dataSet.push(sub);
      const startDate = new Date(sub['start']);
      sub['date'] = format(startDate, 'yyyy-MM-dd');
      const stopDate = addMinutes(startDate, sub['duration']);
      const stopTime = format(stopDate, 'h:mm a');
      const startTime = format(startDate, 'h:mm a');
      sub['start'] = startTime;
      sub['end'] = stopTime;
    });
    console.log(dataSet);
  }
}
