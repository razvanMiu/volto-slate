import React from 'react';
import { connect } from 'react-redux';
import { readAsDataURL } from 'promise-file-reader';
import Dropzone from 'react-dropzone';

import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import { Button, Dimmer, Loader, Message } from 'semantic-ui-react';

import { Icon, BlockChooser, SidebarPortal } from '@plone/volto/components';
import { useFormStateContext } from '@plone/volto/components/manage/Form/FormContext';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers';
import { settings } from '~/config';

import { saveSlateBlockSelection } from 'volto-slate/actions';
import { SlateEditor } from 'volto-slate/editor';
import { serializeNodesToText } from 'volto-slate/editor/render';
import { createImageBlock } from 'volto-slate/utils';
import { uploadContent } from 'volto-slate/actions';

import ShortcutListing from './ShortcutListing';
import MarkdownIntroduction from './MarkdownIntroduction';
import { handleKey } from './keyboard';

import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';
import addSVG from '@plone/volto/icons/circle-plus.svg';

import './css/editor.css';

// TODO: refactor dropzone to separate component wrapper

const TextBlockEdit = (props) => {
  const {
    toolbarAlways,
    block,
    data,
    detached,
    index,
    onAddBlock,
    onChangeBlock,
    onMutateBlock,
    onSelectBlock,
    pathname,
    properties,
    selected,
    uploadRequest,
    uploadContent,
    uploadedContent,
  } = props;

  const { slate } = settings;
  const { textblockExtensions } = slate;
  const { value } = data;

  const [addNewBlockOpened, setAddNewBlockOpened] = React.useState();
  const [showDropzone, setShowDropzone] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [newImageId, setNewImageId] = React.useState(null);

  const prevReq = React.useRef(null);

  const formContext = useFormStateContext();

  const withBlockProperties = React.useCallback(
    (editor) => {
      editor.getBlockProps = () => {
        return {
          ...props,
        };
      };
      editor.formContext = formContext;
      return editor;
    },
    [props, formContext],
  );

  const onDrop = React.useCallback(
    (files) => {
      // TODO: need to fix setUploading, treat uploading indicator
      // inteligently, show progress report on uploading files
      setUploading(true);
      files.forEach((file) => {
        const [mime] = file.type.split('/');
        if (mime !== 'image') return;

        readAsDataURL(file).then((data) => {
          const fields = data.match(/^data:(.*);(.*),(.*)$/);
          uploadContent(
            getBaseUrl(pathname),
            {
              '@type': 'Image',
              title: file.name,
              image: {
                data: fields[3],
                encoding: fields[2],
                'content-type': fields[1],
                filename: file.name,
              },
            },
            block,
          );
        });
      });
      setShowDropzone(false);
    },
    [pathname, uploadContent, block],
  );

  const { loaded, loading } = uploadRequest;
  const imageId = uploadedContent['@id'];
  const prevLoaded = prevReq.current;

  React.useLayoutEffect(() => {
    if (loaded && !loading && !prevLoaded && newImageId !== imageId) {
      const url = flattenToAppURL(imageId);
      setNewImageId(imageId);
      createImageBlock('', index, {
        onChangeBlock,
        onAddBlock,
      }).then((imageblockid) => {
        const options = {
          '@type': 'image',
          url,
        };
        onChangeBlock(imageblockid, options);
      });
    }
    prevReq.current = loaded;
  }, [
    loaded,
    loading,
    prevLoaded,
    imageId,
    newImageId,
    index,
    onChangeBlock,
    onAddBlock,
  ]);

  // const blockChooserRef = React.useRef();
  const handleClickOutside = React.useCallback((e) => {
    const blockChooser = document.querySelector('.blocks-chooser');
    document.removeEventListener('mousedown', handleClickOutside, false);
    if (doesNodeContainClick(blockChooser, e)) return;
    setAddNewBlockOpened(false);
  }, []);

  return (
    <>
      <SidebarPortal selected={selected}>
        <div id="slate-plugin-sidebar"></div>
        <ShortcutListing />
        <MarkdownIntroduction />
      </SidebarPortal>

      <Dropzone
        disableClick
        onDrop={onDrop}
        className="dropzone"
        onDragOver={() => setShowDropzone(true)}
        onDragLeave={() => setShowDropzone(false)}
      >
        {showDropzone ? (
          <div className="drop-indicator">
            {uploading ? (
              <Dimmer active>
                <Loader indeterminate>Uploading image</Loader>
              </Dimmer>
            ) : (
              <Message>
                <center>
                  <img src={imageBlockSVG} alt="" />
                </center>
              </Message>
            )}
          </div>
        ) : (
          <SlateEditor
            toolbarAlways={toolbarAlways}
            index={index}
            properties={properties}
            onAddBlock={onAddBlock}
            extensions={textblockExtensions}
            renderExtensions={[withBlockProperties]}
            onSelectBlock={onSelectBlock}
            value={value}
            block={block}
            onChange={(value, selection) => {
              onChangeBlock(block, {
                ...data,
                value,
                plaintext: serializeNodesToText(value || []),
                // TODO: also add html serialized value
              });
            }}
            onClick={(ev) => {
              // this is needed so that the click event does
              // not bubble up to the Blocks/Block/Edit.jsx component
              // which attempts to focus the TextBlockEdit on
              // click and this behavior breaks user selection, e.g.
              // when clicking once a selected word
              ev.stopPropagation();
            }}
            onKeyDown={handleKey}
            selected={selected}
            placeholder={data.placeholder || 'Enter some rich text…'}
          />
        )}
      </Dropzone>
      {!detached && !data.plaintext && (
        <Button
          basic
          icon
          onClick={() => {
            document.addEventListener('mousedown', handleClickOutside, false);
            setAddNewBlockOpened(!addNewBlockOpened);
          }}
          className="block-add-button"
        >
          <Icon name={addSVG} className="block-add-button" size="24px" />
        </Button>
      )}
      {addNewBlockOpened && (
        <BlockChooser
          onMutateBlock={(...args) => {
            onMutateBlock(...args);
            setAddNewBlockOpened(false);
          }}
          currentBlock={block}
        />
      )}
    </>
  );
};

export default connect(
  (state, props) => {
    return {
      uploadRequest: state.upload_content?.[props.block]?.upload || {},
      uploadedContent: state.upload_content?.[props.block]?.data || {},
    };
  },
  {
    uploadContent,
    saveSlateBlockSelection, // needed as editor blockProps
  },
)(TextBlockEdit);
