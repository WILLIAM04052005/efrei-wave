const currentYear = new Date().getFullYear()

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>© {currentYear} Efrei Wave Music - By William JR</p>
      </div>
    </footer>
  )
}

export default Footer