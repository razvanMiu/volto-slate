// TODO! important! Read https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/

import React from 'react';

import codeSVG from '@plone/volto/icons/code.svg';

import { FootnoteElement } from './render';
import FootnoteButton from './FootnoteButton';
import { withFootnote } from './editorPlugins';
import FootnotesBlockView from './FootnotesBlockView';
import FootnotesBlockEdit from './FootnotesBlockEdit';

export default function install(config) {
  const { slate } = config.settings;

  slate.buttons.footnote = (props) => <FootnoteButton {...props} />;
  slate.elements.footnote = FootnoteElement;

  slate.editorPlugins = [...(slate.editorPlugins || []), withFootnote];
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'footnote'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'footnote',
  ];

  config.blocks.blocksConfig.slateFootnotes = {
    id: 'slateFootnotes',
    title: 'Slate Footnotes',
    icon: codeSVG,
    group: 'text',
    view: FootnotesBlockView,
    edit: FootnotesBlockEdit,
    restricted: false,
    mostUsed: true,
    blockHasOwnFocusManagement: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };

  return config;
}