import React, { useEffect, useRef, useState } from 'react';
import Head from "next/head";
import styled, { css } from 'styled-components';

const frameStyle = css`
  outline: 1px solid black;
  box-sizing: border-box;
  padding: 10mm;
`;

const Wrapper = styled.main`
  ${frameStyle}
  display: grid;
  grid-template-areas: 'content' 'editor' 'input';
  grid-template-rows: 1fr auto auto;
  grid-template-columns: 1fr;
  width: 100%;
  height: 100%;
  min-height: 100vh;
`;
const EditorArea = styled.textarea`
  ${frameStyle}
  caret-shape: block;
  grid-area: editor;
`;

const Content = styled.section`
  ${frameStyle}
  grid-area: content;
  overflow-x: scroll;
`;

const Input = styled.section`
  ${frameStyle}
  grid-area: input;
`;

const EditorInputOptions = styled.ul`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: baseline;
  margin: 0;
  padding: 0;
`;

const EditorInputOption = styled.li`
  list-style: none;
`;

const Output = styled.pre``;

export default function EditorPage() {
  const [textInput, setTextInput] = useState('');
  const [inputOptions, setInputOptions] = useState([]);
  const [background, setBackground] = useState('white');
  const [color, setColor] = useState('blue');
  const editorTextInputRef = useRef();
  const inputOptionsRef = useRef();

  const clefOptions = [
    <button key='treble' onClick={() => handleInputChoice('treble')}>treble</button>,
    <button key='alto' onClick={() => handleInputChoice('alto')}>alto</button>,
    <button key='bass' onClick={() => handleInputChoice('bass')}>bass</button>,
  ];

  useEffect(() => {
    inputOptions.length > 0 && inputOptionsRef.current.firstElementChild.focus();
  }, [inputOptions]);

  const handleInputChoice = (value) => {
    setTextInput(textInput + value);
    editorTextInputRef.current.focus();
    setInputOptions([]);
  }

  const handleInputChange = (event) => {
    switch (event.nativeEvent.data) {
      case 'b':
        setBackground('blue');
        setColor('white');
        break;
      case 'c':
        setInputOptions(clefOptions);
        break;
      case 'w':
        setBackground('white');
        setColor('blue');
        break;
      case 'escape':
        setInputOptions([]);
        break;
      default:
        setTextInput(event.target.value);
    }
  }
  const [output, setOutput] = useState();

  useEffect(() => {
    setOutput(JSON.stringify(textInput, null, 2));
  }, [textInput]);

  return (
    <Wrapper>
      <Head />
      <EditorArea ref={editorTextInputRef} value={textInput} onChange={handleInputChange} />
      <Content style={{ background, color }}>
        <Output>{output}</Output>
      </Content>
      <Input>
        {inputOptions && (
          <EditorInputOptions ref={inputOptionsRef}>
            {inputOptions.map((option, optionIndex) => (
              <EditorInputOption key={optionIndex}>{option}</EditorInputOption>
            ))}
          </EditorInputOptions>
        )}
      </Input>
    </Wrapper>
  )
}