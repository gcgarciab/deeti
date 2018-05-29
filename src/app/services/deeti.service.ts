import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { RequestOptions } from '@angular/http';
import { Headers } from '@angular/http/src/headers';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AnimationKeyframesSequenceMetadata } from '@angular/core/src/animation/dsl';

@Injectable()
export class DeetiService {

  wordBack: any = {};
  tokens: any = {};
  gateToken = 'gcps9ur4t2l2';
  gatePassword = '500dafuikkpkiicygm8g';
  gateURL = 'https://cloud-api.gate.ac.uk/process-document/opennlp-english-pipeline';
  wordsApiToken = 'kZw6kHGeXDmshp8C3QFwBPdqbINOp1cw7UAjsn0HnFxUTEwpAC';
  wordsApiURL = 'https://wordsapiv1.p.mashape.com/words/';

  constructor(private http: HttpClient) {

  }

  escapeRegExp(text: string) {
    return text.replace(/[-[\]{}()*+?.,!\\^$|#\s]/g, ' ');
  }

  splitText( text: string ): string[] {
    return (this.escapeRegExp(text.trim()).split(' ').filter( word => {
      return (word !== '');
    }));
  }

  loadWords(words: string[]) {

    const httpOptions = {
      headers: new HttpHeaders({
        'X-Mashape-Key': 'kZw6kHGeXDmshp8C3QFwBPdqbINOp1cw7UAjsn0HnFxUTEwpAC',
        'X-Mashape-Host': 'wordsapiv1.p.mashape.com'
      })
    };

    words.forEach((word: string) => {
      if (!this.wordBack[word]) {
        this.http.get('https://wordsapiv1.p.mashape.com/words/' + word + '/definitions', httpOptions)
          .subscribe(res => {
            this.wordBack[word] = Observable.of( {
              word: word,
              error: false,
              // message: 'Ok',
            });
          }, (err: any) => {
            this.wordBack[word] = Observable.of({
              word: word,
              error: true,
              // message: 'Ok',
            });
          });
      }
    });
    /* Respuesta de la consulta de una nueva palabra en el observable */
    // console.log(this.wordBack);
  }

  // getOrthographyErrors() {
  //   console.log(this.wordBack);
  // }

  gateTest(words: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain',
        'Authorization': 'Basic Z2Nwczl1cjR0MmwyOjUwMGRhZnVpa2twa2lpY3lnbThn',
        'Accept': 'application/gate+json'
      })
    };

    return this.http.post(this.gateURL + '?annotations=:Token', words, httpOptions)
      .map((res: any ) => {
        return res.entities.Token;
      });
  }
}
