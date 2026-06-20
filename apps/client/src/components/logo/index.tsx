import { Link } from "react-router-dom"

const Logo = (props: { url?: string }) => {
  const { url = "/" } = props
  return (
    <div className="flex items-center justify-center sm:justify-start">
      <Link to={url}>
        <img src="/favicon.svg" alt="TeamSync" className="h-6 w-6" />
      </Link>
    </div>
  )
}

export default Logo
