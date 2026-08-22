// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PageAudioControl from "./PageAudioControl";

vi.mock("wouter", () => ({
  useLocation: () => ["/"],
}));

const playMock = vi.fn();
const pauseMock = vi.fn();

describe("PageAudioControl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    playMock.mockResolvedValue(undefined);
    Object.defineProperty(HTMLMediaElement.prototype, "play", { configurable: true, value: playMock });
    Object.defineProperty(HTMLMediaElement.prototype, "pause", { configurable: true, value: pauseMock });
  });

  afterEach(() => {
    cleanup();
  });

  it("lit la narration naturelle de la page et permet pause, reprise et arrêt", async () => {
    const user = userEvent.setup();
    const { container } = render(<PageAudioControl />);
    const audio = container.querySelector("audio") as HTMLAudioElement;
    const trigger = screen.getByRole("button", { name: /écouter accueil/i });

    expect(audio.src).toContain("narration-accueil_2b319306.wav");
    playMock.mockClear();
    pauseMock.mockClear();
    await user.tab();
    expect(document.activeElement).toBe(trigger);
    await user.keyboard("{Enter}");
    expect(playMock).toHaveBeenCalledOnce();

    fireEvent.play(audio);
    await waitFor(() => expect(screen.getByRole("button", { name: /mettre la lecture en pause/i })).toBeTruthy());
    await user.click(screen.getByRole("button", { name: /mettre la lecture en pause/i }));
    expect(pauseMock).toHaveBeenCalled();

    fireEvent.pause(audio);
    await user.click(screen.getByRole("button", { name: /reprendre la lecture/i }));
    expect(playMock).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole("button", { name: /arrêter la lecture/i }));
    expect(pauseMock).toHaveBeenCalledTimes(2);
  });

  it("explique clairement une erreur de chargement de la narration", async () => {
    const { container } = render(<PageAudioControl />);
    fireEvent.error(container.querySelector("audio") as HTMLAudioElement);
    expect(await screen.findByText(/narration naturelle ne peut pas être lue/i)).toBeTruthy();
  });
});
