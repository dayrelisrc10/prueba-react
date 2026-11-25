import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getPosts, getUsers } from "./api";
import type { Post, User } from "./types";

type LoadState = "loading" | "success" | "error";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function UserAvatar({ name, large = false }: { name: string; large?: boolean }) {
  return (
    <span className={`avatar${large ? " avatar-large" : ""}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [usersState, setUsersState] = useState<LoadState>("loading");
  const [usersError, setUsersError] = useState("");
  const [retryUsers, setRetryUsers] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsState, setPostsState] = useState<LoadState>("success");
  const [postsError, setPostsError] = useState("");
  const [retryPosts, setRetryPosts] = useState(0);
  const [createdPosts, setCreatedPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setUsersState("loading");
    setUsersError("");
    getUsers(controller.signal)
      .then((result) => {
        setUsers(result);
        setUsersState("success");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setUsersError(
          error instanceof Error ? error.message : "No se pudieron cargar los usuarios.",
        );
        setUsersState("error");
      });

    return () => controller.abort();
  }, [retryUsers]);

  useEffect(() => {
    if (!selectedUser) {
      setPosts([]);
      setPostsState("success");
      setPostsError("");
      return;
    }

    const controller = new AbortController();
    setPostsState("loading");
    setPostsError("");
    getPosts(selectedUser.id, controller.signal)
      .then((result) => {
        setPosts(result);
        setPostsState("success");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setPostsError(
          error instanceof Error ? error.message : "No se pudieron cargar las publicaciones.",
        );
        setPostsState("error");
      });

    return () => controller.abort();
  }, [selectedUser, retryPosts]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) return users;
    return users.filter((user) =>
      user.name.toLocaleLowerCase().includes(normalizedSearch),
    );
  }, [search, users]);

  const visiblePosts = selectedUser
    ? [
        ...createdPosts.filter((post) => post.userId === selectedUser.id),
        ...posts,
      ]
    : [];

  function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) return;

    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle || !cleanBody) {
      setFormError("Completa el título y el texto para publicar.");
      setNotice("");
      return;
    }

    setCreatedPosts((current) => [
      {
        id: -Date.now(),
        userId: selectedUser.id,
        title: cleanTitle,
        body: cleanBody,
      },
      ...current,
    ]);
    setTitle("");
    setBody("");
    setFormError("");
    setNotice("Tu publicación se añadió a la lista.");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Voces, inicio">
          <span className="brand-mark" aria-hidden="true">
            v.
          </span>
          <span>voces</span>
        </a>
        <span className="topbar-note">Una comunidad de ideas</span>
        <span className="topbar-badge">
          <span className="status-dot" />
          API en vivo
        </span>
      </header>

      <section className="intro">
        <p className="eyebrow">PERSONAS &amp; CONVERSACIONES</p>
        <h1>Las buenas ideas<br />empiezan <span>con alguien.</span></h1>
        <p className="intro-copy">
          Conoce a la comunidad y descubre lo que tienen para compartir.
        </p>
      </section>

      <div className="workspace">
        <aside className="people-panel" aria-label="Comunidad">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">LA COMUNIDAD</p>
              <h2>Personas <span className="count-pill">{users.length}</span></h2>
            </div>
            <span className="online-indicator" title="Comunidad disponible" />
          </div>

          <label className="search-box">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              type="search"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar usuarios por nombre"
            />
            {search && (
              <button
                className="clear-search"
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </label>

          {usersState === "loading" && (
            <div className="state-message" role="status">
              <span className="spinner" />
              <span>Cargando comunidad...</span>
            </div>
          )}
          {usersState === "error" && (
            <div className="state-message error-message" role="alert">
              <p>{usersError}</p>
              <button
                className="text-button"
                type="button"
                onClick={() => setRetryUsers((current) => current + 1)}
              >
                Intentar de nuevo
              </button>
            </div>
          )}
          {usersState === "success" && (
            <div className="user-list">
              {filteredUsers.map((user) => (
                <button
                  type="button"
                  className={`user-card${selectedUser?.id === user.id ? " is-selected" : ""}`}
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setNotice("");
                    setFormError("");
                  }}
                  aria-pressed={selectedUser?.id === user.id}
                >
                  <UserAvatar name={user.name} />
                  <span className="user-card-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-company">{user.company.name}</span>
                  </span>
                  <svg className="chevron" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="m7.5 4 6 6-6 6" />
                  </svg>
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p className="empty-search">No encontramos personas con ese nombre.</p>
              )}
            </div>
          )}
          <p className="panel-footnote">Personas reales, conversaciones que inspiran.</p>
        </aside>

        <section className="feed-panel" aria-label="Publicaciones">
          {!selectedUser ? (
            <div className="welcome-card">
              <div className="welcome-art" aria-hidden="true">
                <span className="art-sun" />
                <span className="art-line art-line-one" />
                <span className="art-line art-line-two" />
                <span className="art-dot art-dot-one" />
                <span className="art-dot art-dot-two" />
                <span className="art-dot art-dot-three" />
              </div>
              <p className="eyebrow">TU PRÓXIMA LECTURA TE ESPERA</p>
              <h2>Todo empieza<br />por elegir a alguien.</h2>
              <p>Selecciona una persona de la comunidad para leer sus publicaciones y sumarte a la conversación.</p>
              <span className="welcome-hint"><span>←</span> Elige a alguien en la lista</span>
            </div>
          ) : (
            <>
              <div className="profile-header">
                <UserAvatar name={selectedUser.name} large />
                <div className="profile-copy">
                  <p className="eyebrow">PUBLICACIONES DE</p>
                  <h2>{selectedUser.name}</h2>
                  <p>{selectedUser.company.name} <span>·</span> {selectedUser.address.city}</p>
                </div>
                <span className="post-count">
                  {visiblePosts.length} {visiblePosts.length === 1 ? "POST" : "POSTS"}
                </span>
              </div>

              <div className="feed-heading">
                <div>
                  <h3>Su espacio</h3>
                  <p>Ideas compartidas con la comunidad</p>
                </div>
                <span className="feed-heading-mark" aria-hidden="true">✳</span>
              </div>

              {postsState === "loading" && (
                <div className="state-message posts-loading" role="status">
                  <span className="spinner" />
                  <span>Cargando publicaciones...</span>
                </div>
              )}
              {postsState === "error" && (
                <div className="state-message error-message post-error" role="alert">
                  <p>{postsError}</p>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => setRetryPosts((current) => current + 1)}
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}
              {postsState === "success" && (
                <div className="post-list">
                  {visiblePosts.map((post, index) => (
                    <article className="post-card" key={`${post.id}-${index}`}>
                      <div className="post-card-top">
                        <span className="post-label">
                          {post.id < 0 ? "RECIÉN PUBLICADO" : `PUBLICACIÓN ${String(index + 1).padStart(2, "0")}`}
                        </span>
                        <span className="post-sparkle" aria-hidden="true">✳</span>
                      </div>
                      <h4>{post.title}</h4>
                      <p>{post.body}</p>
                      <div className="post-author">
                        <UserAvatar name={selectedUser.name} />
                        <span>{selectedUser.name}</span>
                      </div>
                    </article>
                  ))}
                  {visiblePosts.length === 0 && (
                    <p className="empty-posts">Todavía no hay publicaciones. ¡Sé la primera persona en compartir algo!</p>
                  )}
                </div>
              )}

              <form className="composer" onSubmit={createPost} noValidate>
                <div className="composer-heading">
                  <span className="composer-icon" aria-hidden="true">↗</span>
                  <div>
                    <h3>¿Algo que compartir?</h3>
                    <p>Las buenas conversaciones empiezan contigo.</p>
                  </div>
                </div>
                <label htmlFor="post-title">Título</label>
                <input
                  id="post-title"
                  type="text"
                  required
                  placeholder="Dale un título a tu idea..."
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  aria-invalid={Boolean(formError && !title.trim())}
                />
                <label htmlFor="post-body">Tu publicación</label>
                <textarea
                  id="post-body"
                  placeholder="¿Qué tienes en mente?"
                  rows={3}
                  required
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  aria-invalid={Boolean(formError && !body.trim())}
                />
                <div className="composer-footer">
                  <span className={formError ? "form-feedback form-error" : "form-feedback"} role={formError ? "alert" : "status"}>
                    {formError || notice}
                  </span>
                  <button className="publish-button" type="submit">
                    Publicar <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
      <footer className="page-footer">
        <span>Voces — un espacio para compartir.</span>
        <span>Hecho para escuchar mejor <span className="footer-heart">♥</span></span>
      </footer>
    </main>
  );
}
