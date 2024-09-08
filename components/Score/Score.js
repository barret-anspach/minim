"use client";

import React from 'react';

import Event from '../Event';
import Item from '../Item';
import Measure from '../Measure';
import Staff from '../Staff';
import StaffDisplayItem from '../StaffDisplayItem';
import Systems from '../Systems';
import { withNoSSR } from '../../hooks/withNoSSR';
import { useMeasuresContext } from '../../contexts/MeasuresContext';

const metadata = require('../../public/fonts/bravura/bravura_metadata.json');

function Score({ score }) {
  const { context: { measures } } = useMeasuresContext();

  return (
    <Systems id="systems">
      {measures.map((measure, index) => (
        <Measure
          index={index}
          key={`measure_${index}`}
          measure={measure}
          final={index + 1 === measures.length}
          parts={new Array(2)}
        >
          <Staff number={1} clef={'treble'} duration={measure.duration}>
            {index === 0 && (
              <Item size={2} pitch={'g4'} column={'m-text'} padEnd={1}>Violin 1</Item>
            )}
            {index !== 0 && measure.first && (
              <Item size={2} pitch={'g4'} column={'m-text'} padEnd={1}>Vln.1</Item>
            )}
            {/* TODO: check previous measure for whether clef or key is different from current */}
            {measure.first && (
              <>
                <Item pitch="g4" column={'m-cle'} padEnd={metadata.engravingDefaults.barlineSeparation}></Item>
                <StaffDisplayItem type="key" start="m-key">
                  <Item pitch="b4" column={1}></Item>
                  <Item pitch="e5" column={2}></Item>
                </StaffDisplayItem>
              </>
            )}
            <StaffDisplayItem type="tim" start="m-tim">
              <Item text pitch="b4">{measure.duration / 512}</Item>
              <Item text pitch="e4">8</Item>
            </StaffDisplayItem>

            <Event beat={1} pitch={'g4'}></Event>
            <Event beat={170} pitch={'b4'}></Event>
            <Event beat={341} pitch={'d5'}></Event>
          </Staff>

          <Staff number={2} clef={'treble'} duration={measure.duration}>
            {index === 0 && (
              <Item size={2} pitch={'g4'} column={'m-text / m-bracket'} padEnd={1}>Violin 2</Item>
            )}
            {index !== 0 && measure.first && (
              <Item size={2} pitch={'g4'} column={'m-text'} padEnd={1}>Vln.2</Item>
            )}
            {/* TODO: check previous measure for whether clef or key is different from current */}
            {measure.first && (
              <>
                <Item pitch="g4" column={'m-cle'} padEnd={metadata.engravingDefaults.barlineSeparation}></Item>
                <StaffDisplayItem type="key" start="m-key">
                  <Item pitch="b4" column={1}></Item>
                  <Item pitch="e5" column={2}></Item>
                </StaffDisplayItem>
              </>
            )}
            <StaffDisplayItem type="tim" start="m-tim">
              <Item text pitch="b4">{measure.duration / 512}</Item>
              <Item text pitch="e4">8</Item>
            </StaffDisplayItem>

            <Event beat={1} pitch={'c5'}></Event>
            <Event beat={256} pitch={'a4'}></Event>
          </Staff>
        </Measure>
      ))}
    </Systems>
  )
}

export default withNoSSR(Score);
