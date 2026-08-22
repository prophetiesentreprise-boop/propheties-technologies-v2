import { describe, expect, it } from "vitest";
import { getServiceExpertiseDetail } from "./serviceExpertiseDetails";
import { serviceExpertises } from "./serviceExpertises";
import { contactDetails, contentDefaults, editorialTutorials, services, visualDefaults, visualSlotLabels } from "./siteContent";

describe("editorialTutorials", () => {
  it("provides a complete production script for every tutorial", () => {
    expect(editorialTutorials).toHaveLength(4);

    for (const tutorial of editorialTutorials) {
      expect(tutorial.productionScript.objective.length).toBeGreaterThan(20);
      expect(tutorial.productionScript.format).toContain("Vertical 9:16");
      expect(tutorial.productionScript.shots).toHaveLength(5);
      expect(tutorial.productionScript.callToAction.length).toBeGreaterThan(10);
      tutorial.productionScript.shots.forEach((shot) => {
        expect(shot.visual.length).toBeGreaterThan(10);
        expect(shot.voiceOver.length).toBeGreaterThan(10);
      });
    }
  });
});

describe("contenus administrables des services", () => {
  it("expose les textes de chaque service et le visuel du CTA sombre dans le registre owner", () => {
    expect(visualDefaults.serviceDetailDarkCta).toBeTruthy();
    expect(visualSlotLabels.serviceDetailDarkCta.label).toContain("Détail service");

    for (const service of services) {
      const key = `service.${service.slug}`;
      expect(contentDefaults[`${key}.label`]?.value).toBe(service.label);
      expect(contentDefaults[`${key}.title`]?.value).toBe(service.title);
      expect(contentDefaults[`${key}.promise`]?.value).toBe(service.detail.promise);
      expect(contentDefaults[`${key}.context`]?.value).toBe(service.detail.context);
      expect(contentDefaults[`${key}.feature.1`]?.value).toBe(service.features[0]);
      expect(contentDefaults[`${key}.approach.1`]?.value).toBe(service.detail.approach[0]);
      expect(contentDefaults[`${key}.outcome.1`]?.value).toBe(service.detail.outcomes[0]);
    }
  });
});

describe("coordonnées professionnelles", () => {
  it("utilise les adresses, lignes téléphoniques et WhatsApp officiels confirmés", () => {
    expect(contactDetails.email).toBe("infos@prophetiestechnologies.com");
    expect(contactDetails.directorEmail).toBe("dir@prophetiestechnologies.com");
    expect(contactDetails.additionalEmail).toBe("prophetiesentreprise@gmail.com");
    expect(contactDetails.phoneHref).toBe("tel:+2250501416124");
    expect(contactDetails.secondaryPhoneHref).toBe("tel:+2250150694243");
    expect(contactDetails.whatsappUrl).toBe("https://wa.me/2250150694243");
    expect(contactDetails.domain).toBe("prophetiestechnologies.com");
  });
});

describe("sous-expertises détaillées", () => {
  it("propose une page approfondie, distincte et administrable pour chaque point de service", () => {
    expect(serviceExpertises).toHaveLength(24);
    expect(new Set(serviceExpertises.map((item) => `${item.serviceSlug}/${item.slug}`)).size).toBe(serviceExpertises.length);
    expect(serviceExpertises.find((item) => item.slug === "telephonie-voip")?.intro).toContain("VoIP");
    for (const expertise of serviceExpertises) {
      const key = `expertise.${expertise.serviceSlug}.${expertise.slug}`;
      const detail = getServiceExpertiseDetail(expertise);
      expect(contentDefaults[`${key}.title`]?.value).toBe(expertise.title);
      expect(contentDefaults[`${key}.intervention.1`]?.value).toBe(expertise.interventions[0]);
      expect(contentDefaults[`${key}.deliverable.1`]?.value).toBe(expertise.deliverables[0]);
      expect(contentDefaults[`${key}.contextTitle`]?.value).toBe(detail.contextTitle);
      expect(contentDefaults[`${key}.context`]?.value).toBe(detail.context);
      expect(contentDefaults[`${key}.analysis.1`]?.value).toBe(detail.analysisPoints[0]);
      expect(contentDefaults[`${key}.objective.1`]?.value).toBe(detail.objectivePoints[0]);
      expect(detail.context.length).toBeGreaterThan(170);
      expect(detail.analysisPoints).toHaveLength(3);
      expect(detail.objectivePoints).toHaveLength(3);
    }
  });

  it("conserve un cadrage métier spécifique pour les prestations demandées", () => {
    const telephonie = getServiceExpertiseDetail(serviceExpertises.find((item) => item.slug === "telephonie-voip")!);
    const cablage = getServiceExpertiseDetail(serviceExpertises.find((item) => item.slug === "cablage-informatique-televisuel")!);
    const pca = getServiceExpertiseDetail(serviceExpertises.find((item) => item.slug === "pca-pra-resilience")!);
    expect(telephonie.context).toMatch(/appel/i);
    expect(cablage.context).toContain("câblage");
    expect(pca.context).toContain("reprise");
  });
});

describe("cartes de valeur illustrées", () => {
  it("expose quatre images de fond administrables pour les valeurs de l’accueil", () => {
    expect(visualDefaults.valueReliability).toBeTruthy();
    expect(visualDefaults.valueConfidentiality).toBeTruthy();
    expect(visualDefaults.valueRigor).toBeTruthy();
    expect(visualDefaults.valueResponsiveness).toBeTruthy();
    expect(visualSlotLabels.valueReliability.label).toContain("Fiabilité");
    expect(visualSlotLabels.valueConfidentiality.label).toContain("Confidentialité");
  });
});

describe("méthodes de services illustrées", () => {
  it("associe à chaque service un fond de méthode administrable", () => {
    for (const service of services) {
      expect(service.methodVisualSlot).toBeTruthy();
      expect(visualDefaults[service.methodVisualSlot]).toBeTruthy();
      expect(visualSlotLabels[service.methodVisualSlot].label).toContain("Méthode");
    }
  });
});

describe("QR code de présentation", () => {
  it("expose un QR code et son libellé dans les registres administrables", () => {
    expect(visualDefaults.aboutQrCode).toContain("propheties-technologies-qr-code");
    expect(visualSlotLabels.aboutQrCode.label).toContain("QR code");
    expect(contentDefaults["about.qr.kicker"]?.value).toBeTruthy();
    expect(contentDefaults["about.qr.description"]?.value).toBeTruthy();
  });
});
