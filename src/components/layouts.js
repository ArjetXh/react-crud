
import { Link } from "react-router-dom"

export function Navbar(){
  return(<nav className="navbar navbar-expand-lg bg-light">
    <div className="container-fluid">
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link active" aria-current="page" to="/jobs">Jobs</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/inventory">Inventory</Link>
          </li>
        </ul>
     
      </div>
    </div>
  </nav>
  )
}

export function Footer(){
  return(
    <div className="text-center p-4 border-top">
      <img src="./logo192.png" alt="logo" width="30" className="m-3"/>
      Flex
    </div>
  )
}