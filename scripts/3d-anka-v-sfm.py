import pycolmap, pathlib, time
S=pathlib.Path('.'); db=S/'db.db'; img=S/'kareler'; out=S/'sparse'; out.mkdir(exist_ok=True)
if db.exists(): db.unlink()
t=time.time()
eo=pycolmap.FeatureExtractionOptions(); eo.sift.max_num_features=8000
ro=pycolmap.ImageReaderOptions(); ro.camera_model='OPENCV'
pycolmap.extract_features(db, img, camera_mode=pycolmap.CameraMode.SINGLE, reader_options=ro, extraction_options=eo)
print('features', time.time()-t, flush=True)
so=pycolmap.SequentialPairingOptions(); so.overlap=12; so.loop_detection=False
pycolmap.match_sequential(db, pairing_options=so)
print('match', time.time()-t, flush=True)
maps=pycolmap.incremental_mapping(db, img, out)
for k,r in maps.items(): print('model',k,r.summary())
print('done', time.time()-t)
