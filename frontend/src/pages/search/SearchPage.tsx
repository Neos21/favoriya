import { ChangeEvent, FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Alert, Button, Stack, TextField, Typography } from '@mui/material';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { isEmptyString } from '../../common/helpers/is-empty-string';
import { LoadingSpinnerComponent } from '../../shared/components/LoadingSpinnerComponent/LoadingSpinnerComponent';
import { PostsListComponent } from '../../shared/components/PostsListComponent/PostsListComponent';
import { useApiGet } from '../../shared/hooks/use-api-fetch';

import type { Post, PostApi } from '../../common/types/post';
import type { Result } from '../../common/types/result';

/** Search Page */
export const SearchPage: FC = () => {
  /** 1回につき読み込む件数 */
  const offsetAmount = 50;
  
  // クエリ文字列を取得する
  const navigate = useNavigate();
  const location = useLocation();
  const paramQuery = new URLSearchParams(location.search).get('query');
  
  const apiGet = useApiGet();
  
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [inputQuery, setInputQuery] = useState<string>('');  // フォーム文字列
  const [currentQuery, setCurrentQuery] = useState<string>('');  // 検索表示中の文字列
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isNextLoading, setIsNextLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [posts, setPosts] = useState<Array<Post>>([]);
  
  /** 最初の検索結果タイムラインを取得する */
  const fetchFirstPosts = useCallback(async (query: string) => {
    if(isEmptyString(query)) return console.warn('クエリ文字列が空のため初期検索しない');
    
    setStatus('loading');
    setPosts([]);
    // 検索表示中の文字列として設定する
    setCurrentQuery(query);
    // URL を変更する
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('query', query);
    navigate(`/search?${newSearchParams.toString()}`);
    
    try {
      const response = await apiGet('/search', `?query=${encodeURIComponent(query)}&offset=0&limit=${offsetAmount}`);  // Throws
      const postsApi: Result<Array<PostApi>> = await response.json();  // Throws
      if(postsApi.error != null) return setStatus('failed');
      
      const fetchedPosts: Array<Post> = postsApi.result.map(postApi => snakeToCamelCaseObject(postApi) as Post);
      setPosts(fetchedPosts);
      setHasMore(fetchedPosts.length >= offsetAmount);  // オフセット値以下の件数しか取れなかったら続きがないとみなす
      setOffset(fetchedPosts.length);  // 最初のオフセット値は取得した投稿数にする
      setStatus('succeeded');
    }
    catch(error) {
      setStatus('failed');
      console.error('検索結果の取得に失敗', error);
    }
  }, [apiGet, navigate]);
  
  // 初回読み込み : クエリパラメータがあれば処理する
  useEffect(() => {
    if(!isEmptyString(paramQuery)) {
      setInputQuery(paramQuery);  // フォームに設定する
      fetchFirstPosts(paramQuery);  // 初期検索を行う
    }
    else {
      setStatus('succeeded');
    }
  }, [fetchFirstPosts, paramQuery]);
  
  /** フォームの値保持 */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputQuery(event.target.value);
  };
  
  /** 検索する */
  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetchFirstPosts(inputQuery);
  };
  
  /** 続きを読み込む */
  const onFetchNextPosts = async () => {
    if(isEmptyString(currentQuery)) return console.warn('クエリ文字列が空のため続きの検索をしない');
    setIsNextLoading(true);
    try {
      const response = await apiGet('/search', `?query=${encodeURIComponent(currentQuery)}&offset=${offset}&limit=${offsetAmount}`);  // Throws
      const postsApi: Result<Array<PostApi>> = await response.json();  // Throws
      if(postsApi.error != null) return console.error('検索結果の続きの読み込みに失敗', postsApi);
      
      const fetchedPosts: Array<Post> = postsApi.result.map(postApi => snakeToCamelCaseObject(postApi) as Post);
      setPosts(previousPosts => [...previousPosts, ...fetchedPosts]);
      setHasMore(fetchedPosts.length >= offsetAmount);  // オフセット値以下の件数しか取れなかったら続きがないとみなす
      setOffset(previousOffset => previousOffset + fetchedPosts.length);  // 取得した投稿数を足す
    }
    catch(error) {
      console.error('検索結果の続きの読み込み処理に失敗', error);
    }
    finally {
      setIsNextLoading(false);
    }
  };
  
  return <>
    <Typography component="h1" variant="h4" sx={{ mt: 3 }}>検索</Typography>
    
    <Stack component="form" onSubmit={onSearch} direction="row" sx={{ mt: 3 }} spacing={1}>
      <TextField
        type="text" name="text" label="検索キーワード" value={inputQuery} onChange={onChange}
        required autoFocus
        fullWidth margin="normal" size="small"
      />
      <Button type="submit" variant="contained" disabled={isEmptyString(inputQuery) || status === 'loading'}>検索</Button>
    </Stack>
    
    {status === 'loading' && <LoadingSpinnerComponent />}
    
    {status === 'failed' && <Alert severity="error" sx={{ mt: 3 }}>検索結果の取得に失敗</Alert>}
    
    {status === 'succeeded' && isEmptyString(currentQuery) && <Alert severity="info" sx={{ mt: 3 }}>検索条件を入力してください</Alert>}
    
    {status === 'succeeded' && !isEmptyString(currentQuery) && posts.length === 0 && <Alert severity="success" sx={{ mt: 3 }}>検索結果はありません</Alert>}
    
    {status === 'succeeded' && !isEmptyString(currentQuery) && posts.length > 0 && <>
      <PostsListComponent propPosts={posts} />
      <Typography component="p" sx={{ mt: 3, textAlign: 'right' }}>
        {hasMore
          ? <Button variant="contained" onClick={onFetchNextPosts} disabled={isNextLoading}>続きを読む</Button>
          : <Button variant="contained" disabled>フィードの終わり</Button>
        }
      </Typography>
    </>}
  </>;
};
