import React from 'react';

import SlateEditor from './../editor';
import { plaintext_serialize } from './../editor/render';

// See https://docs.voltocms.com/blocks/anatomy/

const TextBlockEdit = ({
  type,
  id,
  data,
  selected,
  index,
  pathname,
  block,
  onChangeBlock,
  onDeleteBlock,
  onFocusPreviousBlock,
  detached,
  onMutateBlock,
  ...props
}) => {
  const { value } = data;

  return (
    <SlateEditor
      value={value}
      data={data}
      block={block}
      detached={detached}
      onMutateBlock={onMutateBlock}
      onChange={(value) => {
        onChangeBlock(block, {
          ...data,
          value,
          plaintext: plaintext_serialize(value || []),
        });
      }}
      selected={selected}
      onFirstPositionBackspace={() => {
        if (plaintext_serialize(value || []).length === 0) {
          onDeleteBlock(id, true);
        }
      }}
    />
  );
};

export default TextBlockEdit;
