import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import type { Post, User } from "./types";

const users: User[] = [
  {
    id: 1,
    name: "Leanne Graham",
    username: "Bret",
    email: "leanne@example.com",
    address: { city: "Gwenborough" },
    company: { name: "Romaguera-Crona" },
  },
  {
    id: 2,
    name: "Ervin Howell",
    username: "Antonette",
    email: "ervin@example.com",
    address: { city: "Wisokyburgh" },
    company: { name: "Deckow-Crist" },
  },
];

const posts: Post[] = [
  {
    id: 10,
    userId: 1,
    title: "Ideas para el fin de semana",
    body: "Un buen libro y un paseo al aire libre.",
  },
];

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (input) => {
    const url = String(input);
    return url.includes("/users")
      ? jsonResponse(users)
      : jsonResponse(posts.filter((post) => url.includes(`userId=${post.userId}`)));
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Voces", () => {
  it("filtra usuarios por nombre sin distinguir mayúsculas", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole("button", { name: /Leanne Graham/ });
    await user.type(screen.getByRole("searchbox", { name: /Buscar usuarios/ }), "ERVIN");

    expect(screen.getByRole("button", { name: /Ervin Howell/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Leanne Graham/ })).not.toBeInTheDocument();
  });

  it("carga las publicaciones del usuario seleccionado", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: /Leanne Graham/ }));

    expect(await screen.findByText("Ideas para el fin de semana")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://jsonplaceholder.typicode.com/posts?userId=1",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("valida los campos obligatorios y añade la publicación creada", async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      return url.includes("/users") ? jsonResponse(users) : jsonResponse([]);
    });
    render(<App />);
    await user.click(await screen.findByRole("button", { name: /Leanne Graham/ }));
    await screen.findByText("¿Algo que compartir?");

    await user.click(screen.getByRole("button", { name: /Publicar/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Completa el título y el texto para publicar.",
    );

    await user.type(screen.getByLabelText("Título"), "Mi nueva idea");
    await user.type(screen.getByLabelText("Tu publicación"), "Una conversación empieza aquí.");
    await user.click(screen.getByRole("button", { name: /Publicar/ }));

    expect(await screen.findByText("Mi nueva idea")).toBeInTheDocument();
    expect(screen.getByText("Una conversación empieza aquí.")).toBeInTheDocument();
  });

  it("muestra un error visible cuando no se pueden cargar los usuarios", async () => {
    fetchMock.mockRejectedValue(new Error("Sin conexión"));
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Sin conexión");
    expect(screen.getByRole("button", { name: "Intentar de nuevo" })).toBeInTheDocument();
  });
});
