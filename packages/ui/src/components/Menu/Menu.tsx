import cn from 'clsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueues } from '../../hooks/useQueues';
import { SearchIcon } from '../Icons/Search';
import s from './Menu.module.css';
import { toTree } from '../../utils/toTree';
import { QueueTree } from './QueueTree/QueueTree';

export const Menu = () => {
  const { t } = useTranslation();
  const { queues } = useQueues();
  const [searchTerm, setSearchTerm] = useState('');

  const tree = toTree(
    queues?.filter((queue) =>
      queue.name?.toLowerCase().includes(searchTerm?.toLowerCase() as string)
    ) || []
  );

  return (
    <aside className={s.aside}>
      <div className={s.secondary}>{t('MENU.QUEUES')}</div>
      {(queues?.length || 0) > 0 && (
        <div className={s.searchWrapper}>
          <SearchIcon />
          <input
            className={s.search}
            type="search"
            id="search-queues"
            placeholder={t('MENU.SEARCH_INPUT_PLACEHOLDER')}
            value={searchTerm}
            onChange={({ currentTarget }) => setSearchTerm(currentTarget.value)}
          />
        </div>
      )}
      <nav>
        <QueueTree tree={tree} classNames={s} />
      </nav>
      <a
        className={cn(s.appVersion, s.secondary)}
        target="_blank"
        rel="noreferrer"
        href={process.env.BULL_BOARD_REPO}
      >
        {process.env.APP_VERSION}
      </a>
    </aside>
  );
};
