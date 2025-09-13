import styles from "./page.module.scss";

export default function Home() {
  return (
    <div className={styles.page}>
      <header>WYS</header>
      <main className={styles.main}>

      </main>
      <footer className={styles.footer}>
        footer
        {/* <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a> */}
      </footer>
    </div>
  );
}
