function NavbarLogo(props) {
  return (
    <div className="inline-flex align-middle cursor-pointer my-1.5">
      <img
        className={'ml-1 sm:ml-2 mr-3.5 h-6 self-center nav-logo invert'}
        src="https://d1zic6dm9txw4h.cloudfront.net/rulebricks-docs-assets/static/images/application/logo.png"
        alt="Rulebricks Logo"
      />
      <span className="text-xl font-semibold mt-0.5">Rulebricks</span>
    </div>
  )
}

export default NavbarLogo
