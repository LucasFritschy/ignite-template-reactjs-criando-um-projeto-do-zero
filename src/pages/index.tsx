/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination?: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <>
      <main className={commonStyles.container}>
        <img src="/Logo.svg" alt="logo" />

        {postsPagination.results.map(result => (
          <div className={styles.postPreview}>
            <h2>{result.data.title}</h2>
            <p>{result.data.subtitle}</p>
            <div>
              <time>
                <FiCalendar /> {result.first_publication_date}
              </time>
              <span>
                <FiUser />
                {result.data.author}
              </span>
            </div>
          </div>
        ))}
        {postsPagination.next_page ? (
          <button className={styles.loadButton} type="button">
            Carregar mais posts
          </button>
        ) : null}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.slug'],
      pageSize: 10,
    }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(result => {
      return {
        uid: result.uid,
        first_publication_date: format(
          new Date(result.first_publication_date),
          'dd MMM yyyy'
        ),
        data: {
          title: result.data.title,
          subtitle: result.data.subtitle,
          author: result.data.author,
        },
      };
    }),
  };

  return {
    props: {
      postsPagination,
    },
  };
};
