import { Injectable } from '@nestjs/common';

/** Post Decoration Service */
@Injectable()
export class PostDecorationService {
  /** タグ */
  private readonly tagChoices: Array<{ start: string, end: string, replacements?: Array<string> }> = [
    { start: ''                             , end: '' },  // 一切加工しない
    { start: '<h1★>'                       , end: '</h1>'     , replacements: ['', ' align="center"', ' align="right"'] },
    { start: '<h2★>'                       , end: '</h2>'     , replacements: ['', ' align="center"', ' align="right"'] },
    { start: '<h3★>'                       , end: '</h3>'     , replacements: ['', ' align="center"', ' align="right"'] },
    { start: '<h4★>'                       , end: '</h4>'     , replacements: ['', ' align="center"', ' align="right"'] },
    { start: '<h5★>'                       , end: '</h5>'     , replacements: ['', ' align="center"', ' align="right"'] },
    { start: '<h6★>'                       , end: '</h6>'     , replacements: ['', ' align="center"', ' align="right"'] },
    { start: '<font face="serif" size="★">', end: '</font>'   , replacements: ['1', '2', '3', '4', '5', '6', '7'] },
    { start: '<marquee★>'                  , end: '</marquee>', replacements: ['', ' direction="right"', ' direction="up"', ' direction="down"'] },
    { start: '<b>'                          , end: '</b>'        },
    { start: '<i>'                          , end: '</i>'        },
    { start: '<del>'                        , end: '</del>'      },
    { start: '<em>'                         , end: '</em>'       },
    { start: '<strong>'                     , end: '</strong>'   },
    { start: '<font color="#936"><b>'       , end: '</b></font>' },
    { start: '<blink>'                      , end: '</blink>'    },
    { start: '<mark>'                       , end: '</mark>'     },
    { start: '<code>'                       , end: '</code>'     }
  ];
  
  /** 行ごとにランダムに HTML タグを装飾する */
  public decorateText(beforeText: string): string {
    const afterText = beforeText
      .split('\n')
      .map(lineText => {
        const choicedTag = Object.assign({}, this.tagChoices[Math.floor(Math.random() * this.tagChoices.length)]);
        if(choicedTag.replacements != null) {
          choicedTag.start = choicedTag.start.replace((/★/), choicedTag.replacements[Math.floor(Math.random() * choicedTag.replacements.length)]);
        }
        return choicedTag.start + lineText + choicedTag.end;
      })
      .join('\n');
    return afterText;
  }
}
