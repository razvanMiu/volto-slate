import { Button } from 'semantic-ui-react';
import React from 'react';
import { useSlate } from 'slate-react';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';

import { Icon as VoltoIcon } from '@plone/volto/components';
import tagSVG from '@plone/volto/icons/tag.svg';
import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
// import formatClearSVG from '@plone/volto/icons/format-clear.svg';
import { Icon } from '@plone/volto/components';

import InlineForm from 'volto-slate/futurevolto/InlineForm';

import { ToolbarButton } from 'volto-slate/editor/ui';
import { FootnoteSchema } from './schema';
import { FOOTNOTE } from 'volto-slate/constants';
import { useIntl, defineMessages } from 'react-intl';
import checkSVG from '@plone/volto/icons/check.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import editingSVG from '@plone/volto/icons/editing.svg';
import usePluginToolbar from 'volto-slate/editor/usePluginToolbar';

// import { isEqual } from 'lodash';

import './less/editor.less';

const messages = defineMessages({
  edit: {
    id: 'Edit footnote',
    defaultMessage: 'Edit footnote',
  },
  delete: {
    id: 'Delete footnote',
    defaultMessage: 'Delete footnote',
  },
});

export const wrapFootnote = (editor, data) => {
  if (isActiveFootnote(editor)) {
    unwrapFootnote(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const footnote = {
    type: FOOTNOTE,
    data,
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, { ...footnote, children: [{ text: '' }] });
  } else {
    Transforms.wrapNodes(editor, footnote, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

function insertFootnote(editor, data) {
  if (editor.selection) {
    wrapFootnote(editor, data);
  }
}

export const unwrapFootnote = (editor) => {
  Transforms.unwrapNodes(editor, { match: (n) => n.type === FOOTNOTE });
};

export const isActiveFootnote = (editor) => {
  const [note] = Editor.nodes(editor, { match: (n) => n.type === FOOTNOTE });

  return !!note;
};

export const getActiveFootnote = (editor) => {
  const [node] = Editor.nodes(editor, { match: (n) => n.type === FOOTNOTE });
  return node;
};

export const updateFootnotesContextFromActiveFootnote = (
  editor,
  {
    setFormData,
    setAndSaveSelection,
    saveSelection = true,
    clearIfNoActiveFootnote = true,
  },
) => {
  if (saveSelection) {
    setAndSaveSelection(editor.selection);
  }

  const note = getActiveFootnote(editor);
  // debugger;
  if (note) {
    const [node] = note;
    const { data, children } = node;

    const r = {
      ...data,
      // ...JSON.parse(JSON.stringify(footnote.getFormData())),
      // ...JSON.parse(
      //   JSON.stringify(data),
      // footnote: children?.[0]?.text,
    };

    // console.log('R is ', r);

    setFormData(r);
  } else if (editor.selection && clearIfNoActiveFootnote) {
    setFormData({});
  }
};

const FootnoteButton = () => {
  const editor = useSlate();
  const intl = useIntl();

  const isFootnote = isActiveFootnote(editor);

  const [showEditForm, setShowEditForm] = React.useState(false);
  const [selection, setSelection] = React.useState(null);
  const [formData, setFormData] = React.useState({});

  const setAndSaveSelection = React.useCallback(
    (sel) => {
      console.log('set and save selection,', sel);
      setSelection(sel);
      setShowEditForm(false);
    },
    [setSelection, setShowEditForm],
  );

  const submitHandler = React.useCallback(
    (formData) => {
      // debugger;
      // TODO: have an algorithm that decides which one is used
      // if (typeof formData.footnote !== 'string') {
      // const sel = footnoteRef.current.getSelection();
      console.log('submitHandler', selection);
      const sel = selection; // should we save selection?
      if (Range.isRange(sel)) {
        Transforms.select(editor, sel);
        insertFootnote(editor, { ...formData });
      } else {
        Transforms.deselect(editor);
      }
      // } else {
      // unwrapFootnote(editor);
      // }
    },
    [editor, selection],
  );

  const openSidebar = React.useCallback(
    (fromPluginToolbar) => {
      // if (!showEditForm) {
      // debugger;

      const fromHoveringToolbar = !fromPluginToolbar;

      // debugger;
      if (fromPluginToolbar) {
        console.log('fromPluginToolbar selection', selection);
        updateFootnotesContextFromActiveFootnote(editor, {
          setAndSaveSelection: setSelection,
          // setAndSaveSelection,
          setFormData,
        });
        // ReactEditor.focus(editor);
      } else {
        console.log('fromHoveringToolbar selection', selection);
        insertFootnote(editor, {});
        setFormData({});
      }

      // }

      // const note = getActiveFootnote(editor);
      // debugger;
      // if (note) {
      //   const [node] = note;
      //   const { data, children } = node;
      //   const r = {
      //     ...data,
      //     // ...JSON.parse(JSON.stringify(footnote.getFormData())),
      //     // ...JSON.parse(
      //     //   JSON.stringify(data),
      //     // footnote: children?.[0]?.text,
      // };
      // console.log('R is ', r);
      //   setFormData(r);
      // } else {
      setShowEditForm(true);
      // }
    },
    [editor, selection, setSelection],
  );

  const PluginToolbar = React.useCallback(
    () => (
      <>
        <Button.Group>
          <Button
            icon
            basic
            aria-label={intl.formatMessage(messages.edit)}
            onMouseDown={() => {
              openSidebar(true);
            }}
          >
            <Icon name={editingSVG} size="18px" />
          </Button>
        </Button.Group>
        <Button.Group>
          <Button
            icon
            basic
            aria-label={intl.formatMessage(messages.delete)}
            onMouseDown={() => {
              unwrapFootnote(editor);
              ReactEditor.focus(editor);
            }}
          >
            <Icon name={clearSVG} size="18px" />
          </Button>
        </Button.Group>
      </>
    ),
    [intl, openSidebar, editor],
  );

  usePluginToolbar(editor, isActiveFootnote, getActiveFootnote, PluginToolbar);

  // console.log('render FootnoteButton,', selection);

  return (
    <>
      <SidebarPopup open={showEditForm}>
        <InlineForm
          schema={FootnoteSchema}
          title={FootnoteSchema.title}
          icon={<VoltoIcon size="24px" name={briefcaseSVG} />}
          onChangeField={(id, value) => {
            console.log('onChangeField', selection);
            // debugger;
            setFormData({
              ...formData,
              [id]: value,
            });
          }}
          formData={formData}
          headerActions={
            <>
              <button
                onMouseDown={() => {
                  console.log(
                    '// #2 BEFORE / ',
                    formData,
                    getActiveFootnote(editor),
                  );
                  setShowEditForm(false);
                  submitHandler(formData);
                  ReactEditor.focus(editor);
                  console.log('BEFore ', selection);
                  if (Range.isRange(selection)) {
                    Transforms.select(editor, selection);
                  }

                  setTimeout(() => {
                    console.log('beFORe', selection);
                    Transforms.select(editor, selection);
                    console.log(
                      '// #2 BEFORE / ',
                      selection,
                      getActiveFootnote(editor),
                    );
                  }, 2000);
                }}
              >
                <VoltoIcon size="24px" name={checkSVG} />
              </button>
              <button
                onMouseDown={() => {
                  setShowEditForm(false);
                  ReactEditor.focus(editor);
                }}
              >
                <VoltoIcon size="24px" name={clearSVG} />
              </button>
            </>
          }
        />
      </SidebarPopup>

      <ToolbarButton
        active={isFootnote}
        disabled={isFootnote}
        onMouseDown={() => {
          openSidebar(false);
        }}
        icon={tagSVG}
      />
    </>
  );
};

export default FootnoteButton;
