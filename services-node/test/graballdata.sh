
for r in csp-domains accounts clusters storage-provisioners service-plans ; do 
	datafile=data_$r.js
	echo "const "$r"_data = " > $datafile
	curl http://localhost:8443/api/v1/$r | jq . >> $datafile
	echo ";" >> $datafile
done

