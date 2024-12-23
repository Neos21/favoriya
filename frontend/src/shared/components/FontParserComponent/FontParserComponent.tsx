import DOMPurify from 'dompurify';
import { useSelector } from 'react-redux';

import { emojiConstants } from '../../constants/emoji-constants';
import { RootState } from '../../stores/store';

import type { Emoji } from '../../../common/types/emoji';

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

/** font・blink 要素を置換する */
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
  
  return document.body.innerHTML;
};

/** ブロック要素の開始タグ直前・終了タグ直後にある改行を削る (空行ができないようにする) */
const removeLineBreaks = (html: string) => html
  .replace((/\n(<(marquee|h1|h2|h3|h4|h5|h6|p|div)>)/g  ), '$1')
  .replace((/(<\/(marquee|h1|h2|h3|h4|h5|h6|p|div)>)\n/g), '$1');

/** URL 文字列を a 要素にする */
const convertUrlsToLinks = (html: string) => html
  .replace((/(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/igu), url => `<a href="${url}"  target="_blank" rel="noopener noreferrer" class="normal-link">${url}</a>`)
  .replace( (/(\b(ttps?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/igu), url => `<a href="h${url}" target="_blank" rel="noopener noreferrer" class="hidden-link">${url}</a>`);

/** ハッシュタグ文字列を Link 要素にする : 手前に `=` や `"` がない、"`#` からスペースや空行が続くまでをひとまとまりとする・本当は <Link to=""> で実装したかったが `dangerouslySetInnerHTML` に埋め込めないため a 要素にした */
const convertHashTagsToLinks = (html: string) => html
  .replace((/(?<![="]|color: )#([^\s#]+)/g), match => `<a href="/search?query=${encodeURIComponent(match)}" class="normal-link">${match}</a>`);

/** 絵文字リアクションを画像にする */
const convertEmojiReactions = (html: string, emojis: Array<Emoji>) => html
  .replace((/(\s|^)(:[a-z0-9-]+:)(\s|$)/g), (_match, pattern1, pattern2, pattern3) => {
    const foundEmoji = emojis.find(emoji => `:${emoji.name}:` === pattern2);
    if(foundEmoji == null) return pattern1 + pattern2 + pattern3;  // 見つからなかったらそのまま返す
    return pattern1 + `<img src="${emojiConstants.ossUrl}${foundEmoji.imageUrl}" class="emoji-reaction" title=":${foundEmoji.name}:" alt=":${foundEmoji.name}:">` + pattern3;
  });

type Props = {
  input: string
};

/** Font Parser Component */
export const FontParserComponent: React.FC<Props> = ({ input }) => {
  const emojisState = useSelector((state: RootState) => state.emojis);
  
  // DOMPurify でサニタイズした HTML を取得し、変換処理を適用する
  const tagSanitizedHtml = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['font', 'marquee', 'blink', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'b', 'i', 'u', 's', 'del', 'ins', 'em', 'strong', 'mark', 'code', 'var', 'samp', 'kbd'],  // 許可する要素名
    ALLOWED_ATTR: ['color', 'size', 'face', 'direction', 'scrollamount', 'align']  // 許可する属性
  });
  const tagTransformedHtml    = convertTags(tagSanitizedHtml);
  const lineBreaksRemovedHtml = removeLineBreaks(tagTransformedHtml);
  const urlConvertedHtml      = convertUrlsToLinks(lineBreaksRemovedHtml);
  const hashTagConvertedHtml  = convertHashTagsToLinks(urlConvertedHtml);
  const emojiConvertedHtml    = convertEmojiReactions(hashTagConvertedHtml, emojisState.emojis);
  
  return <div className="font-parser-component" dangerouslySetInnerHTML={{ __html: emojiConvertedHtml }} />;
};
