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

  /*

  Errores de Ortografía - Palabra no existente = Observable[]
  Errores de Ortografía - Mayúscula inicial = initialCapital:boolean
  Errores de Sintaxis = syntaxErrors[]

  */

  text: any = {};
  inputValue = new FormControl();
  words: string[] = [];
  categories: string[] = [];
  sentences: string[] = [];
  wordSentences: string[] = [];
  initialCapital = true;
  syntaxErrors: any = {};
  capitalizeErrors: any = [];
  concordancyErrors: any = {};
  modalErrors: any = {};
  orthographyErrors = [];
  orthographyErrors1 = [];

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
      const err = [];

      this.words.forEach(word => {
        if (word in ObservableWords) {
          aux.push(ObservableWords[word].value);
        }
      });
      this.orthographyErrors1 = err;
      return aux.every(x => x.error === false);

    } else {
      return false;
    }
  }

  runTest() {
    this.words = this.inputValue.value;
    this.orthographyErrors = this.deetiService.wordBack;

    console.log(this.orthographyErrors);
    // ortError.forEach(word => {
    //   word.forEach(e => {
    //     console.log(e);
    //   });
    // });

    // console.log(this.orthographyErrors);
    // console.log(this.orthographyErrors1);

    this.deetiService.gateTest(this.words)
      .subscribe((res: any) => {

        const categories: string[] = [];
        const words: string[] =  [];
        const text: any = {};
        let count = 1;
        res.forEach(element => {
          (element.category === '.' || element.category === ',') ? categories.push(element.string) : categories.push(element.category);

          words.push(element.string);

          (!text['sentence ' + count]) ? text['sentence ' + count] = [[element.string, element.category]] : text['sentence ' + count].push([element.string, element.category]);

          if (element.category === '.' || element.category === ',') {
            count++;
          }
        });

        this.text = text;
        this.categories = categories;
        this.sentences = this.splitSentences(categories);
        this.wordSentences = this.splitSentences(words);
        this.initialCapital = this.validateInitialCapital(words[0]);
        this.testData(this.wordSentences, this.sentences);

      }, err => {
        console.log(err);
      });

  }

  splitSentences(values: string[]) {
    const sentences: any[] = [];
    let sentence: any[] = [];

    if (values.slice(-1)[0] !== ',' && values.slice(-1)[0] !== '?' && values.slice(-1)[0] !== '!' && values.slice(-1)[0] !== '.') {
      values.push('.');
    }

    values.forEach(value => {
      sentence.push(value);
      if (value === '.' || value === ',' || value === '!' || value === '?') {
        sentences.push(sentence);
        sentence = [];
      }
    });

    return sentences;
  }

  testData(wordSentences: string[], tokenSentences: string[]) {
    this.validateSentenceSyntax(wordSentences);
    // console.log('Mayúscula la primera letra: \n' + this.initialCapital);
    this.validateCapitalize(wordSentences);

    this.compareConcordancy(this.text);
  }


  compareGramaticalRules(sentences: any[]) {
    // console.log(sentences);
    sentences.forEach( sentence => {
      const sentenceSymbol = sentence.slice(-1)[0];
      sentence.pop();


      if (sentenceSymbol === '?') {
        console.log('Pregunta');
      } else if (sentenceSymbol === '!'){
        console.log('Exclamación');
      } else {
        console.log('Contexto normal');
      }

    });
    const rules = {
      'O': ['SN', 'SV'],
      'SN': ['D', 'N'],
      'SV': ['V', 'SN', 'SP'],
      'D': ['PDT', 'WDT', 'DT', 'POS', 'PRP$', 'WP$'],
      'A': ['JJ', 'JJR', 'JJS'],
      'N': ['NN', 'NNS', 'NNP', 'NNPS', 'PRP', 'SYM', 'CD', 'WP'],
      'SP': ['P', 'SN'],
      'V': ['VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ'],
      'P': ['IN', 'TO'],
      'Adv': ['RB', 'RBR', 'RBS', 'WHB']
    };
  }

  validateSentenceSyntax(sentences: string[]) {

    sentences.forEach( (sentence, idx) => {
      const text_key = 'sentence ' + (idx + 1);
      for(let i = 0; i < sentence.length - 1; i++) {
        if (sentence[i] === sentence[i + 1]) {
          this.putInDictionary(this.syntaxErrors, 'sentence ' + (idx + 1), sentence[i], [[i, i + 1]]);
          // console.log(Error de sintaxis)
          if (this.text[text_key][i + 1].indexOf('syntaxError') === -1) {
            console.log('Agregar error !!');
            if (this.text[text_key][i].indexOf('syntaxError') === -1) {
              this.text[text_key][i].push('syntaxError');
            }
            this.text[text_key][i + 1].push('syntaxError');
          }
        }
      }
    });

    console.log('Oraciones: \n', sentences);
    console.log('Errores de sintaxis: \n', this.syntaxErrors);
  }

  validateInitialCapital(word): boolean {
    return (/^[A-Z]/.test(word));
  }

  validateCapitalize(wordSentences) {
    wordSentences.forEach( (sentence, idx) => {
      const key = 'sentence ' + (idx + 1);
      if (idx === 0 && !this.validateInitialCapital(sentence[0])) {
        this.capitalizeErrors.push([idx, false]);
        this.text[key][0].push('capitalizeError');
      }
      if (sentence.slice(-1)[0] === '.' && idx < wordSentences.length) {
        if (!this.validateInitialCapital(sentence[0])) {
          this.capitalizeErrors.push([idx, false]);
          this.text[key][0].push('capitalizeError');
        }
      }
    });
    console.log('Errores de mayúsculas: \n', this.capitalizeErrors);
  }

  compareConcordancy(text: any) {
    for (const key in text) {
      if (text.hasOwnProperty(key)) {
        const sentence = text[key];
        let pronoun = [];
        sentence.forEach( (word, idx) => {
          const text_key = 'sentence ' + idx;
          if (word.indexOf('PRP') !== -1) {
            pronoun = [word[0], idx];
          }

          if (word.indexOf('MD') !== -1) {
            const verb = [sentence[idx + 1][0], idx + 1];
            if (sentence[idx + 1].indexOf('VB') !== -1) {
              if (word[0].toLowerCase() === 'will' || word[0].toLowerCase() === 'wo') {
                if (sentence[idx + 1][0].toLowerCase() !== 'be') {
                  // console.log('Error - Futuro');
                  this.putInDictionary(this.concordancyErrors, key, word[0], [[word[0], idx], verb]);
                  this.text[text_key][idx].push('concordancyError');
                  this.text[text_key][idx + 1].push('concordancyError');
                }
              } else {
                // console.log('Error - Modales');
                this.putInDictionary(this.modalErrors, key, word[0], [[word[0], idx], verb]);
                this.text[text_key][idx].push('modalError');
                this.text[text_key][idx + 1].push('modalError');
              }
            } else {
              if ((sentence[idx + 1][0] === 'not' || sentence[idx + 1][0] === "n't")) {
                // Futuro negado
              } else {
                // console.log('Error - Futuro');
                this.putInDictionary(this.concordancyErrors, key, word[0], [[word[0], idx], verb]);
                this.text[text_key][idx].push('concordancyError');
                this.text[text_key][idx + 1].push('concordancyError');
              }
              // console.log(sentence[idx + 1]);
            }
          }

          if (word.indexOf('VBZ') !== -1 || word.indexOf('VB') !== -1 || word.indexOf('VBP') !== -1) {
            if (pronoun.length !== 0) {
              this.validGramaticalTime(key, pronoun, [word, idx]);
            }
          }

          if (word.indexOf('VBG') !== -1) {
            if (!(sentence[idx - 1][0].indexOf('VBZ') !== -1 || sentence[idx - 1][0].indexOf('VBP') !== -1)) {
              if ((sentence[idx - 2].indexOf('MD') !== -1)) {
                // console.log('Futuro contínuo o modal !!');
              } else {
                // console.log('Presente continuo !!!');
              }
            } else {
              const err = [sentence[idx - 1][0], idx - 1];
              this.putInDictionary(this.concordancyErrors, key, word[0], [[word[0], idx], err]);
              // console.log('Error - P. Contínuo');
              this.text[text_key][idx].push('concordancyError');
              this.text[text_key][idx - 1].push('concordancyError');
            }
          }

          if (word.indexOf('VBN') !== -1) {
            const err = [sentence[idx - 1][0], idx - 1];
            if (!(sentence[idx - 1].indexOf('VBZ') !== -1 || sentence[idx - 1].indexOf('VBP') !== -1)) {
              this.putInDictionary(this.concordancyErrors, key, word[0], [[word[0], idx], err]);
              // console.log('Error - Pas. Participio');
              this.text[text_key][idx].push('concordancyError');
              this.text[text_key][idx - 1].push('concordancyError');
            } else {
              if (sentence[idx - 1][0] === 'has' ||  sentence[idx - 1][0] === 'have') {
                // console.log('Está bien !!!!!');
              } else {
                this.putInDictionary(this.concordancyErrors, key, word[0], [[word[0], idx], err]);
                // console.log('Error - Pas. Participio');
                this.text[text_key][idx].push('concordancyError');
                this.text[text_key][idx - 1].push('concordancyError');
              }
            }
          }

          if (word.indexOf('RB') !== -1) {
            if (sentence[idx][0] === "n't" || sentence[idx][0] === 'not') {
              // console.log('Negación !!!');
              if (sentence[idx - 1][0] === 'does' || sentence[idx - 1][0] === 'do') {
                // console.log('Presente simple');
              }
              if (sentence[idx - 1][0] === 'did') {
                // console.log('Pasado simple');
              }
              if (sentence[idx - 1][0] === 'will' || sentence[idx - 1][0] === 'wo') {
                // console.log('Futuro !!');
              }
            }
          }
        });
      }
    }
    console.log('Texto: \n', text);
    console.log('Errores de concordancia: \n', this.concordancyErrors);
    console.log('Errores de modales: \n', this.modalErrors);
  }

  validGramaticalTime(sentence: string, pronoun: any[], time: any[]) {
    /* Verbos en presente simple - 3ra persona */
    const catTime = time[0][1];
    const auxTime = time[0][0];
    time[0] = auxTime;
    if (catTime === 'VBZ') {
      if (!this.validThirdPronoun(pronoun[0].toLowerCase())) {
        this.putInDictionary(this.concordancyErrors, sentence, time[0], [pronoun, time]);
        this.text[sentence][pronoun[1]].push('concordancyError');
        this.text[sentence][time[1]].push('concordancyError');
      }
    }
    /* Verbos en presente simple */
    if (catTime === 'VB' || catTime === 'VBP') {
      if (this.validThirdPronoun(pronoun[0].toLowerCase())) {
        if (auxTime !== 'be') {
          this.putInDictionary(this.concordancyErrors, sentence, time[0], [pronoun, time]);
          this.text[sentence][pronoun[1]].push('concordancyError');
          this.text[sentence][time[1]].push('concordancyError');
        }
      }
    }
    /* Verbos en pasado simple no tienen ningún patrón - Puede admitir cualquier combinación de pronombre/verbo */

  }

  validThirdPronoun(pronoun: string): boolean {
    return (pronoun === 'he' || pronoun === 'she' || pronoun === 'it');
  }


  putInDictionary(dict: any, sentence: string, key: string, value: any[]) {
    if (!dict[sentence]) {
      dict[sentence] = { [key]: value };
    } else if (!dict[sentence][key]) {
      dict[sentence][key] = [value];
    } else {
      dict[sentence][key].push(value);
    }
  }
  // Hacer validación Can - Would (pregunta, negación, afirmación)
  // Hacer validación de Adverbio (generalmente va despues del verbo)
  // Hacer validación de interjecciones (en oraciones que tengan signo de admiración al final)
  // Palabra 'there' - EX validarla porque puede ser válida en múltiples contextos.
  // Regla de la conjunción (no deben ir al final de las oraciones)
}

