-- Script SQL pour activer la recherche Internet pour un utilisateur candidat
-- Remplacez 'hello.jeanchristophebogbe@gmail.com' par l'email de votre choix

-- 1. Créer ou mettre à jour le plan Premium Candidat avec internetJobSearch
INSERT INTO "PricingPlan" (id, name, "displayName", type, price, "billingPeriod", features, "createdAt", "updatedAt")
VALUES (
  'premium_candidate_plan',
  'PREMIUM_CANDIDATE',
  'Premium Candidat',
  'CANDIDATE',
  19.00,
  'MONTHLY',
  '{"maxAIAnalysesMonth": 50, "prioritySupport": true, "advancedAnalytics": true, "internetJobSearch": true}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET features = '{"maxAIAnalysesMonth": 50, "prioritySupport": true, "advancedAnalytics": true, "internetJobSearch": true}'::jsonb,
    "updatedAt" = NOW();

-- 2. Récupérer l'ID de l'utilisateur
DO $$
DECLARE
  user_id TEXT;
  existing_subscription_id TEXT;
BEGIN
  -- Trouver l'utilisateur
  SELECT id INTO user_id FROM "User" WHERE email = 'hello.jeanchristophebogbe@gmail.com';

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé';
  END IF;

  -- Vérifier si une subscription existe déjà
  SELECT id INTO existing_subscription_id FROM "Subscription" WHERE "userId" = user_id;

  IF existing_subscription_id IS NOT NULL THEN
    -- Mettre à jour la subscription existante
    UPDATE "Subscription"
    SET "planId" = 'premium_candidate_plan',
        status = 'ACTIVE',
        "currentPeriodEnd" = NOW() + INTERVAL '30 days',
        "updatedAt" = NOW()
    WHERE id = existing_subscription_id;

    RAISE NOTICE 'Subscription mise à jour pour utilisateur %', user_id;
  ELSE
    -- Créer une nouvelle subscription
    INSERT INTO "Subscription" ("userId", "planId", status, "currentPeriodStart", "currentPeriodEnd", "createdAt", "updatedAt")
    VALUES (
      user_id,
      'premium_candidate_plan',
      'ACTIVE',
      NOW(),
      NOW() + INTERVAL '30 days',
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Nouvelle subscription créée pour utilisateur %', user_id;
  END IF;
END $$;

-- 3. Vérifier que tout est OK
SELECT
  u.email,
  u.name,
  u."userType",
  p."displayName" as plan,
  p.features->>'internetJobSearch' as "Internet Search Enabled"
FROM "User" u
LEFT JOIN "Subscription" s ON s."userId" = u.id
LEFT JOIN "PricingPlan" p ON p.id = s."planId"
WHERE u.email = 'hello.jeanchristophebogbe@gmail.com';
