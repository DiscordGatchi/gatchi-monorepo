import { ColorProp } from 'src/global'

const color: ColorProp = '#0f0f0f'

export default (details: any /* CardDetails */) => (
  <canvasx
    version="1.0.1"
    renderer="skia-canvas"
    context="2d"
    output="png"
    width={408}
    height={608}
    rounded={[12, 32, 12, 32]}
    fonts={[
      {
        family: 'Roboto',
        src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
      },
    ]}
  >
    <flex size="full" p={8}>
      <box
        size="full"
        rounded={[4, 24, 4, 24]}
        bg={details.isSuperShiny ? 'https://example.com/example.png' : color}
      >
        <stack>
          <img
            z={Infinity}
            src="OVERLAY_PATTERN"
            size="full"
            rounded={[12, 32, 12, 32]}
            f:opacity={0.4}
          />
          <flex dir="row" size="full" p={8} align:y="end">
            <box
              size="full"
              bg="linear(to-b, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.9))"
              rounded={[0, 0, 4, 24]}
              height={280}
            />

            <text family="Rubik">Hello World</text>
          </flex>
        </stack>
      </box>
    </flex>
  </canvasx>
)
