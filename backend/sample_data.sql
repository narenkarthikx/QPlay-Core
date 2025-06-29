-- Sample Data for Quantum Quest Supabase Database
-- Run these queries in your Supabase SQL Editor

-- 1. Insert Sample Users
INSERT INTO users (email, username, full_name, is_verified, is_premium, total_playtime, games_completed, best_completion_time, total_score, quantum_mastery_level, created_at) VALUES
('alice@quantumquest.com', 'QuantumAlice', 'Alice Cooper', true, true, 3600, 15, 180, 4500, 5, NOW()),
('bob@quantumquest.com', 'SuperpositionBob', 'Bob Johnson', true, false, 2400, 8, 240, 2800, 3, NOW()),
('charlie@quantumquest.com', 'EntangleCharlie', 'Charlie Brown', true, false, 1800, 12, 200, 3200, 4, NOW()),
('diana@quantumquest.com', 'TunnelingDiana', 'Diana Prince', false, true, 5400, 22, 150, 6800, 6, NOW()),
('eve@quantumquest.com', 'MeasurementEve', 'Eve Adams', true, false, 900, 3, 320, 1200, 2, NOW());

-- 2. Insert Sample Game Sessions
INSERT INTO game_sessions (user_id, started_at, completed_at, total_time, completion_rooms, current_room, room_times, room_attempts, is_completed, difficulty, quantum_data) VALUES
-- Get user IDs from the users we just inserted
((SELECT id FROM users WHERE username = 'QuantumAlice'), NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 180, ARRAY['superposition', 'entanglement'], 'entanglement', JSONB_BUILD_OBJECT('superposition', 90, 'entanglement', 90), JSONB_BUILD_OBJECT('superposition', 1, 'entanglement', 2), true, 'medium', JSONB_BUILD_OBJECT('measurements', 15, 'collapses', 3)),
((SELECT id FROM users WHERE username = 'SuperpositionBob'), NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', 240, ARRAY['superposition'], 'tunneling', JSONB_BUILD_OBJECT('superposition', 120), JSONB_BUILD_OBJECT('superposition', 2), false, 'easy', JSONB_BUILD_OBJECT('measurements', 8, 'collapses', 1)),
((SELECT id FROM users WHERE username = 'EntangleCharlie'), NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', 200, ARRAY['superposition', 'entanglement', 'tunneling'], 'tunneling', JSONB_BUILD_OBJECT('superposition', 60, 'entanglement', 70, 'tunneling', 70), JSONB_BUILD_OBJECT('superposition', 1, 'entanglement', 1, 'tunneling', 1), true, 'hard', JSONB_BUILD_OBJECT('measurements', 18, 'collapses', 2));

-- 3. Insert Sample Leaderboard Entries
INSERT INTO leaderboard_entries (user_id, session_id, category, completion_time, total_score, difficulty, rooms_completed, hints_used, achieved_at) VALUES
-- Score-based leaderboard
((SELECT id FROM users WHERE username = 'TunnelingDiana'), NULL, 'total_score', 150, 6800, 'hard', ARRAY['superposition', 'entanglement', 'tunneling', 'measurement'], 0, NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE username = 'QuantumAlice'), NULL, 'total_score', 180, 4500, 'medium', ARRAY['superposition', 'entanglement'], 1, NOW() - INTERVAL '2 days'),
((SELECT id FROM users WHERE username = 'EntangleCharlie'), NULL, 'total_score', 200, 3200, 'hard', ARRAY['superposition', 'entanglement', 'tunneling'], 0, NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE username = 'SuperpositionBob'), NULL, 'total_score', 240, 2800, 'easy', ARRAY['superposition'], 2, NOW() - INTERVAL '4 days'),
((SELECT id FROM users WHERE username = 'MeasurementEve'), NULL, 'total_score', 320, 1200, 'easy', ARRAY['superposition'], 3, NOW() - INTERVAL '5 days'),

-- Time-based leaderboard
((SELECT id FROM users WHERE username = 'TunnelingDiana'), NULL, 'completion_time', 150, 6800, 'hard', ARRAY['superposition', 'entanglement', 'tunneling', 'measurement'], 0, NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE username = 'QuantumAlice'), NULL, 'completion_time', 180, 4500, 'medium', ARRAY['superposition', 'entanglement'], 1, NOW() - INTERVAL '2 days'),
((SELECT id FROM users WHERE username = 'EntangleCharlie'), NULL, 'completion_time', 200, 3200, 'hard', ARRAY['superposition', 'entanglement', 'tunneling'], 0, NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE username = 'SuperpositionBob'), NULL, 'completion_time', 240, 2800, 'easy', ARRAY['superposition'], 2, NOW() - INTERVAL '4 days'),
((SELECT id FROM users WHERE username = 'MeasurementEve'), NULL, 'completion_time', 320, 1200, 'easy', ARRAY['superposition'], 3, NOW() - INTERVAL '5 days');

-- 4. Insert Sample User Achievements
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, session_id) VALUES
((SELECT id FROM users WHERE username = 'QuantumAlice'), 'first_superposition', NOW() - INTERVAL '10 days', NULL),
((SELECT id FROM users WHERE username = 'QuantumAlice'), 'entanglement_master', NOW() - INTERVAL '8 days', NULL),
((SELECT id FROM users WHERE username = 'QuantumAlice'), 'speed_demon', NOW() - INTERVAL '5 days', NULL),
((SELECT id FROM users WHERE username = 'SuperpositionBob'), 'first_superposition', NOW() - INTERVAL '12 days', NULL),
((SELECT id FROM users WHERE username = 'SuperpositionBob'), 'persistent_player', NOW() - INTERVAL '6 days', NULL),
((SELECT id FROM users WHERE username = 'EntangleCharlie'), 'first_superposition', NOW() - INTERVAL '9 days', NULL),
((SELECT id FROM users WHERE username = 'EntangleCharlie'), 'entanglement_master', NOW() - INTERVAL '7 days', NULL),
((SELECT id FROM users WHERE username = 'EntangleCharlie'), 'tunneling_expert', NOW() - INTERVAL '4 days', NULL),
((SELECT id FROM users WHERE username = 'TunnelingDiana'), 'first_superposition', NOW() - INTERVAL '15 days', NULL),
((SELECT id FROM users WHERE username = 'TunnelingDiana'), 'entanglement_master', NOW() - INTERVAL '14 days', NULL),
((SELECT id FROM users WHERE username = 'TunnelingDiana'), 'tunneling_expert', NOW() - INTERVAL '12 days', NULL),
((SELECT id FROM users WHERE username = 'TunnelingDiana'), 'quantum_master', NOW() - INTERVAL '3 days', NULL),
((SELECT id FROM users WHERE username = 'MeasurementEve'), 'first_superposition', NOW() - INTERVAL '7 days', NULL);

-- 5. Insert Sample Quantum Measurements
INSERT INTO quantum_measurements (user_id, session_id, room_id, measurement_type, measurement_data, timestamp) VALUES
((SELECT id FROM users WHERE username = 'QuantumAlice'), (SELECT id FROM game_sessions WHERE user_id = (SELECT id FROM users WHERE username = 'QuantumAlice') LIMIT 1), 'superposition', 'state_collapse', JSONB_BUILD_OBJECT('initial_state', '|+⟩', 'measured_state', '|1⟩', 'probability', 0.5), NOW() - INTERVAL '2 hours'),
((SELECT id FROM users WHERE username = 'QuantumAlice'), (SELECT id FROM game_sessions WHERE user_id = (SELECT id FROM users WHERE username = 'QuantumAlice') LIMIT 1), 'entanglement', 'bell_measurement', JSONB_BUILD_OBJECT('bell_state', '|Φ+⟩', 'correlation', 0.95), NOW() - INTERVAL '1.5 hours'),
((SELECT id FROM users WHERE username = 'SuperpositionBob'), (SELECT id FROM game_sessions WHERE user_id = (SELECT id FROM users WHERE username = 'SuperpositionBob') LIMIT 1), 'superposition', 'state_collapse', JSONB_BUILD_OBJECT('initial_state', '|+⟩', 'measured_state', '|0⟩', 'probability', 0.5), NOW() - INTERVAL '3 hours'),
((SELECT id FROM users WHERE username = 'EntangleCharlie'), (SELECT id FROM game_sessions WHERE user_id = (SELECT id FROM users WHERE username = 'EntangleCharlie') LIMIT 1), 'tunneling', 'barrier_penetration', JSONB_BUILD_OBJECT('barrier_height', 2.5, 'penetration_probability', 0.15, 'energy', 1.8), NOW() - INTERVAL '45 minutes'),
((SELECT id FROM users WHERE username = 'TunnelingDiana'), NULL, 'measurement', 'quantum_reconstruction', JSONB_BUILD_OBJECT('fidelity', 0.98, 'reconstruction_method', 'tomography'), NOW() - INTERVAL '1 day');

-- 6. Verification Queries
-- You can run these to check if the data was inserted correctly:

-- Check users
SELECT COUNT(*) as user_count FROM users;
SELECT username, email, quantum_mastery_level, total_score FROM users ORDER BY total_score DESC;

-- Check game sessions
SELECT COUNT(*) as session_count FROM game_sessions;
SELECT u.username, gs.total_time, gs.is_completed, gs.difficulty 
FROM game_sessions gs 
JOIN users u ON gs.user_id = u.id 
ORDER BY gs.total_time;

-- Check leaderboard
SELECT COUNT(*) as leaderboard_count FROM leaderboard_entries;
SELECT u.username, le.category, le.total_score, le.completion_time 
FROM leaderboard_entries le 
JOIN users u ON le.user_id = u.id 
ORDER BY le.total_score DESC 
LIMIT 10;

-- Check achievements
SELECT COUNT(*) as achievement_count FROM user_achievements;
SELECT u.username, ua.achievement_id, ua.unlocked_at 
FROM user_achievements ua 
JOIN users u ON ua.user_id = u.id 
ORDER BY ua.unlocked_at DESC;

-- Check quantum measurements
SELECT COUNT(*) as measurement_count FROM quantum_measurements;
SELECT u.username, qm.room_id, qm.measurement_type, qm.timestamp 
FROM quantum_measurements qm 
JOIN users u ON qm.user_id = u.id 
ORDER BY qm.timestamp DESC;
