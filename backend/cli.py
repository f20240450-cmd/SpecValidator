#!/usr/bin/env python3
print("USING CLI:", __file__)
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import argparse
import yaml

from parser import parse_file
from inference import get_engine
from validator import validate_endpoint, build_openapi


def main():
    ap = argparse.ArgumentParser(description="SpecValidator Offline CLI")
    ap.add_argument("file", help="Specification document")
    ap.add_argument("-o", "--output", default="openapi.yaml",
                    help="Output OpenAPI YAML filename")
    args = ap.parse_args()

    path = Path(args.file)
    if not path.exists():
        print(f"File not found: {path}")
        return

    print("Parsing document...")
    sections = parse_file(path)
    if not sections:
        print("No sections found.")
        return

    engine = get_engine()
    endpoints = []

    with ThreadPoolExecutor(max_workers=1) as executor:
        futures = {
            executor.submit(engine.generate, s.title, s.body): s
            for s in sections
        }

        for future in as_completed(futures):
            section = futures[future]
            try:
                result = future.result()
                ok, err = validate_endpoint(result)
                if ok:
                    print(f"OK: {section.title}")
                    endpoints.append(result)
                else:
                    print(f"Invalid: {section.title} ({err})")
            except Exception as e:
                print(f"Error in {section.title}: {e}")

    openapi = build_openapi(path.stem, endpoints)
    with open(args.output, "w") as f:
        yaml.dump(openapi, f, sort_keys=False)

    print(f"Saved {args.output}")


if __name__ == "__main__":
    main()
