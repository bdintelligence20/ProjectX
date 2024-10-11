@bp.route('/query', methods=['POST'])
@cross_origin(origins='https://orange-chainsaw-jj4w954456jj2jqqv-3000.app.github.dev')
def query():
    data = request.json
    user_question = data.get('userQuestion')
    search_scope = data.get('searchScope', 'chosen')  # Default to "chosen" if not provided
    selected_sources = data.get('selectedSources', [])

    if user_question:
        try:
            if search_scope == 'whole':
                # Query the whole vector database (global knowledge base)
                matched_texts = query_pinecone(user_question, namespace="global_knowledge_base")
            elif search_scope == 'chosen' and selected_sources:
                # Query using only the chosen sources by specifying their namespace
                chosen_namespace = "chosen_sources_namespace"
                matched_texts = query_pinecone(user_question, namespace=chosen_namespace, ids=selected_sources)
            else:
                logging.info("No selected sources provided or invalid search scope.")
                return jsonify({"answer": "No sources were selected or the search scope was invalid."}), 400

            if matched_texts:
                # Pass the matched texts and the user's question to the LLM
                response = query_llm(matched_texts, user_question)
                return jsonify({"answer": response}), 200
            else:
                logging.info("No relevant information was found.")
                return jsonify({"answer": "No relevant information was found."}), 404

        except Exception as e:
            logging.error(f"Failed to query data: {str(e)}")
            return jsonify({"error": f"Failed to query data: {str(e)}"}), 500

    logging.error("User question is required")
    return jsonify({"error": "User question is required"}), 400
