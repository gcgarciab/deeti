import { Component, OnInit } from '@angular/core';
import { DeetiService } from '../../services/deeti.service';
import {HttpClientModule} from '@angular/common/http';
import {HttpModule} from '@angular/http';
import {FormControl} from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  inputValue = new FormControl();
  words: string[] = [];
  categories: string[] = [];
  sentences: string[] = [];

  constructor( private deetiService: DeetiService ) { }

  ngOnInit() {
    this.inputValue.valueChanges.debounceTime(1500).subscribe( (newValue: string) => {
      this.validWords();
    });
  }

  validWords() {
    this.words = this.deetiService.splitText( this.inputValue.value );
    this.deetiService.loadWords( this.words );
  }

  isValid() {
    if (this.inputValue.value) {
      this.words = this.deetiService.splitText(this.inputValue.value);
      const ObservableWords = this.deetiService.wordBack;
      const aux = [];

      this.words.forEach(word => {
        if (word in ObservableWords) {
          aux.push(ObservableWords[word].value);
        }
      });
      return aux.every(x => x.error === false);

    } else {
      return false;
    }
  }

  testWords() {
    this.words = this.inputValue.value;
    this.deetiService.gateTest(this.words)
      .subscribe((res: any) => {
        const categories: string[] = [];
        console.log(res);
        res.forEach(element => {
          (element.category === '.' || element.category === ',') ? categories.push(element.string) : categories.push(element.category);
        });
        console.log(categories);
        this.splitSentences(categories);
        this.categories = categories;
      }, err => {
        console.log(err);
      });

  }

  splitSentences(tokens: string[]) {
    const sentences: any[] = [];
    let sentence: any[] = [];
    tokens.forEach(token => {
      sentence.push(token);
      if (token === '.' || token === ',' || token === '!' || token === '?') {
        sentences.push(sentence);
        sentence = [];
      }
    });
    this.sentences = sentences;
    console.log(sentences);
    // console.log(tokens);
  }
}
