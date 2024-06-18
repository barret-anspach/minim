import React from 'react';
import styled, { css } from 'styled-components';

const metadata = require('../public/fonts/bravura/bravura_metadata.json');

const Systems = styled.article`
  container: systems / size;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  row-gap: 2rem;
  width: 100%;
  height: 100%;
  min-height: fit-content;
  padding: 2rem;
  overflow: visible;
`
const Measure = styled.section`
  display: grid;
  grid-template-rows: [staff0] 1fr [staff1] 1fr;
  row-gap: 1rem;
  ${({ $duration }) => $duration ? css`
    grid-template-columns: [m-start m-bra] auto [m-bar] auto [m-cle] auto [m-key] auto [m-tim] auto [m-con] repeat(${$duration}, [e] auto) [me-cle] auto [me-key] auto [me-bar] auto [me-tim] auto [m-end];
    flex: ${$duration} 0 auto;
  ` : css`
    grid-template-columns: repeat(1024, auto);
    flex: 1024 0 auto;
  `}
`
const Staff0 = styled.div`
  grid-row: staff0 / span 1;
  display: grid;
  grid-template-columns: subgrid;
  grid-template-rows: [f5] 0.125rem [e5] 0.125rem [d5] 0.125rem [c5] 0.125rem [b4 center-start] 0.125rem [center-end a4] 0.125rem [g4] 0.125rem [f4] 0.125rem [e4] 0.125rem [d4];
  align-content: start;
  height: 1rem;
  color: purple;
  ${({ $duration }) => $duration ? css`
    grid-column: 1 / span ${$duration};
  ` : css`
    grid-column: 1 / span 1024;
  `}
`
const Staff1 = styled.div`
  grid-row: staff1 / span 1;
  display: grid;
  grid-template-columns: subgrid;
  grid-template-rows: [f5] 0.125rem [e5] 0.125rem [d5] 0.125rem [c5] 0.125rem [b4] 0.125rem [a4] 0.125rem [g4] 0.125rem [f4] 0.125rem [e4] 0.125rem [d4];
  align-content: start;
  height: 1rem;
  ${({ $duration }) => $duration ? css`
    grid-column: 1 / span ${$duration};
  ` : css`
    grid-column: 1 / span 1024;
  `}
`
const StaffLine = styled.hr`
  align-self: start;
  width: 100%;
  height: 0;
  border-style: solid;
  border-top: ${metadata.engravingDefaults.staffLineThickness / 4}rem solid currentColor;
  border-bottom: none;
  margin: 0;
  transform: translateY(-50%);
  ${({ $pitch, $start, $end }) => css`
    grid-row: ${$pitch} / ${$pitch};
    grid-column-start: ${$start};
    grid-column-end: ${$end ?? 'me'};
  `}
`
const Barline = styled.svg.attrs(() => ({
  viewBox: `0 0 1 1`,
  preserveAspectRatio: 'none',
  width: `${metadata.engravingDefaults.thinBarlineThickness / 4}rem`,
  height: '100%',
  overflow: 'visible',
}))`
  justify-self: end;
  height: 100%;
  ${({ $separation }) => $separation && css`
    margin-right: ${metadata.engravingDefaults.barlineSeparation / 4}rem;
  `}
  ${({ $column }) => $column ? css`
    grid-column: ${$column};
  ` : css`
    grid-column: m-bar;
  `}
  ${({ $row }) => $row ? css`
    grid-row: ${$row};
  ` : css`
    grid-row: 1 / -1;
  `}
`
const Period = styled.div`
  container: period / size;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  min-height: fit-content;
`
const Event = styled.div`
  font-family: Bravura, sans-serif;
  height: 0;
  line-height: 0;
  ${({ $beat, $pitch }) => $beat && $pitch && css`
    grid-column-start: e ${$beat};
    grid-row: ${$pitch} / ${$pitch};
  `}
`
const Item = styled.span`
  align-self: start;
  display: flex;
  align-items: center;
  height: 0;
  font-family: Bravura, sans-serif;
  line-height: 0;
  ${({ $pitch }) => $pitch && css`
    grid-row: ${$pitch};
  `}
  ${({ $start }) => $start && css`
    grid-column: ${$start};
  `}
  ${({ $padEnd }) => $padEnd && css`
    padding-right: ${$padEnd / 4}rem;
  `}
`
const Key = styled.span`
  justify-self: start;
  grid-row: 1 / -1;
  ${({ $start }) => $start ? css`
    grid-column-start: ${$start};
  ` : css`
    grid-column-start: m-key;
  `}
  display: inline-grid;
  grid-template-rows: subgrid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  margin-right: 0.1rem;
`
const Tim = styled.span`
  justify-self: start;
  grid-row: 1 / -1;
  ${({ $start }) => $start ? css`
    grid-column-start: ${$start};
  ` : css`
    grid-column-start: m-tim;
  `}
  display: inline-grid;
  grid-auto-flow: row;
  grid-template-columns: 1fr;
  grid-template-rows: subgrid;
  margin-right: 0.1rem;
`

export default function Simple() {
  
  const measures = [
    { duration: 2048 }, { duration: 1024 },{ duration: 1024 },{ duration: 1024 },{ duration: 1024 }, { duration: 2048 }, { duration: 512 }, { duration: 4096 }, { duration: 1024 }, { duration: 768 }
  ];

  // const [gridCols, setGridCols] = useState(0)

  // useLayoutEffect(() => {
  //   const grid = document.getElementById('systems');
  //   const onResize = () => {
  //     setGridCols(
  //       window
  //         .getComputedStyle(grid).gridTemplateColumns
  //         .split(' ')
  //         .filter(c => c !== '0px')
  //     )
  //   }
  //   window.addEventListener('resize', onResize)
  //   return () => {
  //     window.removeEventListener('resize', onResize)
  //   }
  // }, [])

  return (
    <>
      <Systems id="systems">
        <Measure>
          <Staff0>
            <Item $pitch={'f4'} $padEnd={1}>Vln.1</Item>
          </Staff0>
          <Staff1>
            <Item $pitch={'f4'} $padEnd={1}>Vln.2</Item>
          </Staff1>
        </Measure>
        {measures.map((measure, index) => (
          <Measure
            key={`measure_${index}`}
            $duration={measure.duration}
          >
            <Barline $separation>
              <rect width={`${metadata.engravingDefaults.staffLineThickness / 4}rem`} height="100%" fill="black" />
            </Barline>

            <Staff1 $duration={measure.duration}>
              <StaffLine $pitch="f5" $start={'1'} />
              <StaffLine $pitch="d5" $start={'1'} />
              <StaffLine $pitch="b4" $start={'1'} />
              <StaffLine $pitch="g4" $start={'1'} />
              <StaffLine $pitch="e4" $start={'1'} />
              <Item $pitch="g4" $start={'m-cle'} $padEnd={metadata.engravingDefaults.barlineSeparation}></Item>
              <Key>
                <Item $pitch="b4" $start={1}></Item>
                <Item $pitch="e5" $start={2}></Item>
                <Item $pitch="a4" $start={3}></Item>
                <Item $pitch="d5" $start={4}></Item>
              </Key>
              <Tim>
                <Item $pitch={"d5"}></Item>
                <Item $pitch={'g4'}></Item>
              </Tim>
              <Event $beat={1} $pitch={'c5'}></Event>
              <Event $beat={256} $pitch={'a4'}></Event>
            </Staff1>
            <Staff0 $duration={measure.duration}>
              <StaffLine $pitch="f5" $start={'1'} />
              <StaffLine $pitch="d5" $start={'1'} />
              <StaffLine $pitch="b4" $start={'1'} />
              <StaffLine $pitch="g4" $start={'1'} />
              <StaffLine $pitch="e4" $start={'1'} />
              <Item $pitch="g4" $start={'m-cle'} $padEnd={metadata.engravingDefaults.barlineSeparation}></Item>
              <Key>
                <Item $pitch="b4" $start={1}></Item>
                <Item $pitch="e5" $start={2}></Item>
              </Key>
              <Tim>
                <Item $pitch="center"></Item>
              </Tim>
              <Event $beat={1} $pitch={'g4'}></Event>
              <Event $beat={170} $pitch={'b4'}></Event>
              <Event $beat={341} $pitch={'d5'}></Event>
            </Staff0>
          </Measure>
        ))}

        <Measure $duration={2560}>
          <Staff0 $duration={2560}>
            <Period>
              <Measure $duration={512}>
                <Staff0 $duration={512}></Staff0>
              </Measure>
              <Measure $duration={512}>
                <Staff0 $duration={512}></Staff0>
              </Measure>
              <Measure $duration={512}>
                <Staff0 $duration={512}></Staff0>
              </Measure>
              <Measure $duration={512}>
                <Staff0 $duration={512}></Staff0>
              </Measure>
              <Measure $duration={512}>
                <Staff0 $duration={512}></Staff0>
              </Measure>
            </Period>
          </Staff0>
          <Staff1 $duration={2560}>
            <Period>
              <Measure $duration={640}>
                <Staff1 $duration={640}></Staff1>
              </Measure>
              <Measure $duration={640}>
                <Staff1 $duration={640}></Staff1>
              </Measure>
              <Measure $duration={640}>
                <Staff1 $duration={640}></Staff1>
              </Measure>
              <Measure $duration={640}>
                <Staff1 $duration={640}></Staff1>
              </Measure>
            </Period>
          </Staff1>
        </Measure>
      </Systems>
    </>
  )
}