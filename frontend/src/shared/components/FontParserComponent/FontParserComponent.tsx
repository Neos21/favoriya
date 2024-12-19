import DOMPurify from 'dompurify';

const fontSizeMap: Record<string, string> = {
  '1' : '0.75em',
  '2' : '0.85em',
  '3' : '1em',
  '4' : '1.25em',
  '5' : '1.5em',
  '6' : '1.75em',
  '7' : '2em',
  '-4': '0.5em',
  '-3': '0.65em',
  '-2': '0.75em',
  '-1': '0.85em',
  '0' : '1em',
  '+1': '1.25em',
  '+2': '1.5em',
  '+3': '1.75em',
  '+4': '2em'
};

type Props = {
  input: string
};

/** Font Parser Component */
export const FontParserComponent: React.FC<Props> = ({ input }) => {
  /** font 要素などを置換する */
  const convertTags = (html: string) => {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');
    
    // font 要素を span 要素に置換する
    document.querySelectorAll('font').forEach(font => {
      const span = document.createElement('span');
      
      const styles = [];
      
      // color 属性 : style 属性として認識できる値が入りこまないように `;` があったら無視する
      if(font.getAttribute('color') != null && !font.getAttribute('color').includes(';')) {
        // 現状 `<font color="rgba(255, 0, 0, .5)">` などと書いたら解釈できてしまうが、面白いのでコレもアリか
        styles.push(`color: ${font.getAttribute('color')}`);
      }
      
      // size 属性 : 1～7・-4 ～ +4 の表記のみ許可する
      if(font.getAttribute('size') != null && fontSizeMap[font.getAttribute('size')] != null) {
        styles.push(`font-size: ${fontSizeMap[font.getAttribute('size')]}`);
      }
      
      // face 属性 : スペースが入っていたらダブルクォートで全体を囲む
      if(font.getAttribute('face') != null) {
        const fontFace = font.getAttribute('face').includes(' ') ? `"${font.getAttribute('face')}"` : `${font.getAttribute('face')}`;
        styles.push(`font-family: ${fontFace}`);
      }
      
      span.setAttribute('style', styles.join('; '));
      span.innerHTML = font.innerHTML;
      font.replaceWith(span);
    });
    
    // blink 要素を span 要素に変換
    document.querySelectorAll('blink').forEach(blink => {
      const span = document.createElement('span');
      span.style.animation = 'blink-animation 1.5s step-start infinite';
      span.innerHTML = blink.innerHTML;
      blink.replaceWith(span);
    });
    
    // marquee 要素を div 要素に置換する : marquee がそのまま動くのでそれでもいいかも
    //document.querySelectorAll('marquee').forEach(marquee => {
    //  const div = document.createElement('div');
    //  div.style.whiteSpace = 'nowrap';
    //  div.style.position   = 'relative';
    //  div.style.overflow   = 'hidden';
    //  div.style.width      = '100%';
    //  
    //  // アニメーション用のスタイル
    //  const scrollDirection = (() => {
    //    const inputDirection = marquee.getAttribute('direction');
    //    return ['up', 'right', 'cown', 'left'].includes(inputDirection) ? inputDirection : 'left';
    //  })();
    //  const speed = (() => {
    //    const inputAmount = marquee.getAttribute('scrollamount');
    //    const inputAmountNumber = Number(inputAmount);
    //    if(inputAmountNumber > 10 || inputAmountNumber < .1) return 5;  // デフォルト値
    //    return inputAmountNumber;
    //  })();
    //  
    //  const innerDiv = document.createElement('div');
    //  innerDiv.innerHTML        = marquee.innerHTML;
    //  innerDiv.style.whiteSpace = 'nowrap';
    //  innerDiv.style.position   = 'absolute';
    //  innerDiv.style.width      = '100%';
    //  innerDiv.style.animation  = `scroll-${scrollDirection} ${speed}s linear infinite`;
    //  
    //  // 横移動か縦移動かで高さを調整する
    //  div.style.minHeight      = ['right', 'left'].includes(scrollDirection) ? '2rem' : '5rem';
    //  innerDiv.style.minHeight = ['right', 'left'].includes(scrollDirection) ? '2rem' : '5rem';
    //  
    //  
    //  div.appendChild(innerDiv);
    //  marquee.replaceWith(div);
    //});
    
    return document.body.innerHTML;
  };
  
  // DOMPurify でサニタイズした HTML を取得し、変換処理を適用する
  const tagSanitizedHtml = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['font', 'marquee', 'blink', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'b', 'i', 'u', 's', 'del', 'ins', 'em', 'strong', 'mark', 'code', 'var', 'samp', 'kbd'],  // 許可する要素名
    ALLOWED_ATTR: ['color', 'size', 'face', 'direction', 'scrollamount', 'align']  // 許可する属性
  });
  const tagTransformedHtml = convertTags(tagSanitizedHtml);
  
  // ブロック要素の開始タグ直前・終了タグ直後にある改行を削る (空行ができないようにする)
  const removeLineBreaks = (html: string) => html
    .replace((/\n(<(marquee|h1|h2|h3|h4|h5|h6|p|div)>)/g ), '★$1')
    .replace((/(<\/(marquee|h1|h2|h3|h4|h5|h6|p|div)>)\n/g), '$1');
  const lineBreaksRemovedHtml = removeLineBreaks(tagTransformedHtml);
  
  // URL 文字列を a 要素を埋め込む
  const convertUrlsToLinks = (html: string) => html
    .replace((/(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/igu), url => `<a href="${url}"  target="_blank" rel="noopener noreferrer" class="normal-link">${url}</a>`)
    .replace( (/(\b(ttps?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/igu), url => `<a href="h${url}" target="_blank" rel="noopener noreferrer" class="hidden-link">${url}</a>`);
  const transformedHtml = convertUrlsToLinks(lineBreaksRemovedHtml);
  
  return <div className="font-parser-component" dangerouslySetInnerHTML={{ __html: transformedHtml }} />;
};
