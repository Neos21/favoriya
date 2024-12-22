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
  
  /** 川柳の1行目スタイリング用 */
  private senryu1stLineChoices = [
    { start: '<h1><font face="serif">', end: '</font></h1>' },
    { start: '<h2><font face="serif">', end: '</font></h2>' },
    { start: '<h3><font face="serif">', end: '</font></h3>' },
    { start: '<h4><font face="serif">', end: '</font></h4>' },
    { start: '<h5><font face="serif">', end: '</font></h5>' },
    { start: '<h6><font face="serif">', end: '</font></h6>' }
  ];
  
  /** 川柳の2行目スタイリング用 */
  private senryu2ndLineChoices = [
    { start: '<h1 align="center"><font face="serif">', end: '</font></h1>' },
    { start: '<h2 align="center"><font face="serif">', end: '</font></h2>' },
    { start: '<h3 align="center"><font face="serif">', end: '</font></h3>' },
    { start: '<h4 align="center"><font face="serif">', end: '</font></h4>' },
    { start: '<h5 align="center"><font face="serif">', end: '</font></h5>' },
    { start: '<h6 align="center"><font face="serif">', end: '</font></h6>' }
  ];
  
  /** 川柳の3行目スタイリング用 */
  private senryu3rdLineChoices = [
    { start: '<h1 align="right"><font face="serif">', end: '</font></h1>' },
    { start: '<h2 align="right"><font face="serif">', end: '</font></h2>' },
    { start: '<h3 align="right"><font face="serif">', end: '</font></h3>' },
    { start: '<h4 align="right"><font face="serif">', end: '</font></h4>' },
    { start: '<h5 align="right"><font face="serif">', end: '</font></h5>' },
    { start: '<h6 align="right"><font face="serif">', end: '</font></h6>' }
  ];
  
  /** 行ごとにランダムに HTML タグを装飾する */
  public decorateRandomly(beforeText: string): string {
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
  
  /** 川柳モードの場合にテキストを文字寄せする */
  public senryuStyle(beforeText: string): string {
    const lines = beforeText.split('\n');
    if(lines.length !== 3) return beforeText;  // 3行になっていない場合は何もしない
    // タグがなければ1行目をスタイリングする
    if(!(/</).test(lines[0])) {
      const choicedTag = Object.assign({}, this.senryu1stLineChoices[Math.floor(Math.random() * this.senryu1stLineChoices.length)]);
      lines[0] = choicedTag.start + lines[0] + choicedTag.end;
    }
    // タグがなければ2行目をスタイリングする
    if(!(/</).test(lines[1])) {
      const choicedTag = Object.assign({}, this.senryu2ndLineChoices[Math.floor(Math.random() * this.senryu2ndLineChoices.length)]);
      lines[1] = choicedTag.start + lines[1] + choicedTag.end;
    }
    // タグがなければ2行目をスタイリングする
    if(!(/</).test(lines[2])) {
      const choicedTag = Object.assign({}, this.senryu3rdLineChoices[Math.floor(Math.random() * this.senryu3rdLineChoices.length)]);
      lines[2] = choicedTag.start + lines[2] + choicedTag.end;
    }
    const afterText = lines.join('\n');
    return afterText;
  }
}
