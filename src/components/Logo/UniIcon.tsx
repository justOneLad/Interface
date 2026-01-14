import styled from 'styled-components'

import HolidayOrnament from './HolidayOrnament'

// ESLint reports `fill` is missing, whereas it exists on an SVGProps type
type SVGProps = React.SVGProps<SVGSVGElement> & {
  fill?: string
  height?: string | number
  width?: string | number
  gradientId?: string
}

export const UniIcon = (props: SVGProps) => (
  <Container>
    <svg {...props} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 24C8 15 14 8 24 8C30 8 35 11 38 16C40 13 44 12 46 14C48 16 48 20 46 22C44 24 40 24 38 22C37 26 34 30 30 32L32 34C34 36 34 40 32 42C30 44 26 44 24 42C22 40 22 36 24 34L22 32C16 30 12 26 10 20C8 22 4 22 2 20C0 18 0 14 2 12C4 10 8 11 10 14C9 17 8 20 8 24ZM20 18C22 18 24 20 24 22C24 24 22 26 20 26C18 26 16 24 16 22C16 20 18 18 20 18Z"
        fill="currentColor"
      />
    </svg>
    <HolidayOrnament />
  </Container>
)

const Container = styled.div`
  position: relative;
`
